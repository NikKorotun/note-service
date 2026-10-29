<?php

namespace App\DTO;

use JsonSerializable;

/**
 * Выпущенный JWT-токен (Token в спецификации).
 */
final readonly class TokenData implements JsonSerializable
{
    public const TYPE = 'bearer';

    public function __construct(
        public string $accessToken,
        public int $expiresIn,
    ) {
    }

    /**
     * @return array{access_token: string, token_type: string, expires_in: int}
     */
    public function jsonSerialize(): array
    {
        return [
            'access_token' => $this->accessToken,
            'token_type' => self::TYPE,
            'expires_in' => $this->expiresIn,
        ];
    }
}
