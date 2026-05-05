<?php

namespace App\Filament\Resources\DoctorProfiles\Schemas;

use App\Models\User;
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
                    ->label('Doctor User')
                    ->options(
                        User::role('Doctor')
                            ->pluck('name', 'id')
                            ->toArray()
                    )
                    ->searchable()
                    ->required()
                    ->helperText('Select an existing user with Doctor role'),
                TextInput::make('specialization')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g., Cardiology'),
                TextInput::make('experience_years')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->default(0)
                    ->suffix('years'),
                TextInput::make('consultation_fee')
                    ->required()
                    ->numeric()
                    ->prefix('₹')
                    ->minValue(0)
                    ->step(0.01),
                Textarea::make('availability_schedule')
                    ->columnSpanFull()
                    ->placeholder('Enter availability in JSON format'),
            ]);
    }
}
