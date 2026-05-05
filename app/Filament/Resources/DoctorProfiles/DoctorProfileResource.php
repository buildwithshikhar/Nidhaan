<?php

namespace App\Filament\Resources\DoctorProfiles;

use App\Filament\Resources\DoctorProfiles\Pages\CreateDoctorProfile;
use App\Filament\Resources\DoctorProfiles\Pages\EditDoctorProfile;
use App\Filament\Resources\DoctorProfiles\Pages\ListDoctorProfiles;
use App\Filament\Resources\DoctorProfiles\Tables\DoctorProfilesTable;
use App\Models\DoctorProfile;
use App\Models\User;
use BackedEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DoctorProfileResource extends Resource
{
    protected static ?string $model = DoctorProfile::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->label('User')
                    ->options(
                        \App\Models\User::pluck('name', 'id')->toArray()
                    )
                    ->required()
                    ->helperText('Selecting a user will automatically assign them the Doctor role'),

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

    public static function table(Table $table): Table
    {
        return DoctorProfilesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => ListDoctorProfiles::route('/'),
            'create' => CreateDoctorProfile::route('/create'),
            'edit'   => EditDoctorProfile::route('/{record}/edit'),
        ];
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
