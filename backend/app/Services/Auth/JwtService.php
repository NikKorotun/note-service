<?php

namespace App\Services\Auth;

use App\DTO\TokenData;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Support\Str;
use Jose\Component\Checker\ClaimCheckerManager;
use Jose\Component\Checker\ExpirationTimeChecker;
use Jose\Component\Checker\IssuedAtChecker;
use Jose\Component\Checker\IssuerChecker;
use Jose\Component\Checker\NotBeforeChecker;
use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\KeyManagement\JWKFactory;
use Jose\Component\Signature\Algorithm\HS256;
use Jose\Component\Signature\JWSBuilder;
use Jose\Component\Signature\JWSVerifier;
use Jose\Component\Signature\Serializer\CompactSerializer;
use Psr\Clock\ClockInterface;
use RuntimeException;
use Throwable;

/**
 * Выпуск, проверка и пролонгация JWT (HS256) на базе web-token/jwt-framework.
 */
class JwtService
{
    private const ALGORITHM = 'HS256';

    private const MANDATORY_CLAIMS = ['iss', 'iat', 'nbf', 'exp', 'jti'];

    private readonly JWK $key;

    private readonly AlgorithmManager $algorithms;

    private readonly CompactSerializer $serializer;

    /**
     * @param  int  $ttl  время жизни токена, в минутах
     * @param  int  $refreshTtl  окно пролонгации с момента выпуска, в минутах
     */
    public function __construct(
        private readonly ClockInterface $clock,
        private readonly Cache $cache,
        #[\SensitiveParameter] string $secret,
        private readonly string $issuer,
        private readonly int $ttl,
        private readonly int $refreshTtl,
    ) {
        if (strlen($secret) < 32) {
            throw new RuntimeException('JWT_SECRET must be at least 32 bytes long.');
        }

        $this->key = JWKFactory::createFromSecret($secret, ['alg' => self::ALGORITHM, 'use' => 'sig']);
        $this->algorithms = new AlgorithmManager([new HS256()]);
        $this->serializer = new CompactSerializer();
    }

    /**
     * Токен не привязан к пользователю: claim "sub" не выставляется.
     */
    public function issue(): TokenData
    {
        $now = $this->clock->now()->getTimestamp();

        $payload = [
            'iss' => $this->issuer,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $this->ttl * 60,
            'jti' => (string) Str::uuid(),
        ];

        $jws = (new JWSBuilder($this->algorithms))
            ->create()
            ->withPayload(json_encode($payload, JSON_THROW_ON_ERROR))
            ->addSignature($this->key, ['alg' => self::ALGORITHM, 'typ' => 'JWT'])
            ->build();

        return new TokenData(
            accessToken: $this->serializer->serialize($jws, 0),
            expiresIn: $this->ttl * 60,
        );
    }

    /**
     * Проверяет подпись и claims токена и возвращает claims.
     *
     * @return array<string, mixed>
     *
     * @throws InvalidTokenException
     */
    public function decode(string $token, bool $allowExpired = false): array
    {
        try {
            $jws = $this->serializer->unserialize($token);

            if (! (new JWSVerifier($this->algorithms))->verifyWithKey($jws, $this->key, 0)) {
                throw new InvalidTokenException('Invalid token signature.');
            }

            $claims = json_decode($jws->getPayload() ?? '', true, flags: JSON_THROW_ON_ERROR);

            $checkers = [
                new IssuerChecker([$this->issuer]),
                new IssuedAtChecker($this->clock),
                new NotBeforeChecker($this->clock),
            ];
            if (! $allowExpired) {
                $checkers[] = new ExpirationTimeChecker($this->clock);
            }

            (new ClaimCheckerManager($checkers))->check($claims, self::MANDATORY_CLAIMS);
        } catch (InvalidTokenException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new InvalidTokenException('Invalid token.', previous: $e);
        }

        if ($this->isRevoked($claims['jti'])) {
            throw new InvalidTokenException('Token has been revoked.');
        }

        return $claims;
    }

    /**
     * Обменивает текущий токен (в том числе истёкший, но в пределах refresh_ttl)
     * на новый. Старый токен отзывается.
     *
     * @throws InvalidTokenException
     */
    public function refresh(string $token): TokenData
    {
        $claims = $this->decode($token, allowExpired: true);

        $refreshUntil = $claims['iat'] + $this->refreshTtl * 60;
        $now = $this->clock->now()->getTimestamp();

        if ($now > $refreshUntil) {
            throw new InvalidTokenException('Token refresh period has expired.');
        }

        // add() атомарен: если токен уже обменяли параллельным запросом — отказываем
        if (! $this->cache->add($this->revokedKey($claims['jti']), true, $refreshUntil - $now + 1)) {
            throw new InvalidTokenException('Token has been revoked.');
        }

        return $this->issue();
    }

    private function isRevoked(string $jti): bool
    {
        return $this->cache->has($this->revokedKey($jti));
    }

    private function revokedKey(string $jti): string
    {
        return "jwt:revoked:{$jti}";
    }
}
