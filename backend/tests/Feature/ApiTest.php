<?php

it('exposes API metadata at the root', function () {
    $this->getJson('/api')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.version', 'v1');
});

it('returns a JSON error envelope for unknown API endpoints', function () {
    $this->getJson('/api/v1/unknown')
        ->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'NOT_FOUND');
});
