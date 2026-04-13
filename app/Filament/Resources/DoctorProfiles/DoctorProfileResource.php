<?php

namespace App\Filament\Resources\DoctorProfiles;

use App\Filament\Resources\DoctorProfiles\Pages\CreateDoctorProfile;
use App\Filament\Resources\DoctorProfiles\Pages\EditDoctorProfile;
use App\Filament\Resources\DoctorProfiles\Pages\ListDoctorProfiles;
use App\Filament\Resources\DoctorProfiles\Schemas\DoctorProfileForm;
use App\Filament\Resources\DoctorProfiles\Tables\DoctorProfilesTable;
use App\Models\DoctorProfile;
use BackedEnum;
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
        return DoctorProfileForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DoctorProfilesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDoctorProfiles::route('/'),
            'create' => CreateDoctorProfile::route('/create'),
            'edit' => EditDoctorProfile::route('/{record}/edit'),
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
