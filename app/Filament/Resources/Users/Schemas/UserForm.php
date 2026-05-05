<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;
use Spatie\Permission\Models\Role;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->regex('/^[6-9]\d{9}$/')
                    ->placeholder('10-digit number without +91'),
                Select::make('roles')
                    ->label('Roles')
                    ->options(Role::pluck('name', 'name')->toArray())
                    ->multiple()
                    ->required()
                    ->visible(fn () => auth()->user()->hasRole('SuperAdmin')),
                TextInput::make('password')
                    ->password()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state) => filled($state)),
            ]);
    }
}

