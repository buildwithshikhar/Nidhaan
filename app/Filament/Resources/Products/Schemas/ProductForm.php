<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->required()
                    ->preload(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('Product name'),
                TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->placeholder('product-slug'),
                Textarea::make('description')
                    ->columnSpanFull()
                    ->placeholder('Product description'),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('₹')
                    ->minValue(0)
                    ->step(0.01),
                TextInput::make('stock')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->default(0)
                    ->suffix('units'),
                Toggle::make('requires_prescription')
                    ->required()
                    ->default(false),
                TextInput::make('brand')
                    ->maxLength(255)
                    ->placeholder('Brand name (optional)'),
                Textarea::make('salts')
                    ->columnSpanFull()
                    ->placeholder('Active ingredients (optional)'),
            ]);
    }
}
