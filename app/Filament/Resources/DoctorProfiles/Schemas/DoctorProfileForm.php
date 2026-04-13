<?php

namespace App\Filament\Resources\DoctorProfiles\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class DoctorProfileForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                TextInput::make('specialization')
                    ->required(),
                TextInput::make('experience_years')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('consultation_fee')
                    ->required()
                    ->numeric(),
                Textarea::make('availability_schedule')
                    ->columnSpanFull(),
            ]);
    }
}
