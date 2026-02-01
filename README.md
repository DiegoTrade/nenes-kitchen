# 🍳 Nene's Kitchen

A personal meal planning app built for a high-protein, low-carb lifestyle. Designed for my wife (Nene) to help plan and cook meals that support metabolic health.

![Version](https://img.shields.io/badge/version-5.0-coral)
![Recipes](https://img.shields.io/badge/recipes-70+-sage)
![License](https://img.shields.io/badge/license-personal-sand)

## 🎯 What It Does

**Nene's Kitchen** is a single-file PWA (Progressive Web App) that helps plan protein-focused meals. Built specifically for someone managing insulin resistance with a high-protein protocol.

### Features

| Feature | Description |
|---------|-------------|
| 🍖 **70+ Recipes** | Full ingredient lists, steps, and cooking tips |
| 🌮 **Flavor Profiles** | Latin 🌶️, Mediterranean 🌿, Asian 🥢, Spicy 🔥, Classic 🧈 |
| 🍽️ **Meal Types** | Breakfast, Main, Soup, Cold meals, Snacks |
| 🛒 **Smart Shopping List** | Categories, checkboxes, kitchen essentials tracker |
| 🎲 **Surprise Me** | Random recipe suggestions |
| ❤️ **Favorites** | Save and quickly access loved recipes |
| 📜 **History** | Track what you've cooked |
| 🏆 **Achievements** | Gamified progress badges |
| 💕 **Love Notes** | Random sweet messages (the feature she likes most!) |

## 📋 The Protocol

This app is designed around a specific dietary approach:

- **Protein Target**: 180-200g daily (~80-100g per meal)
- **Meal Structure**: 2 meals/day with 18:6 intermittent fasting
- **Fats**: Olive oil, butter, avocado (no seed oils)
- **Carbs**: Low but not strict keto — whole food carbs OK
- **Avoid**: Sugar, flour, bread, rice, processed foods

## 🇻🇪 Venezuelan Roots

Several recipes include Venezuelan favorites adapted for the protocol:
- Pollo con Guasacaca
- Pabellón Sin Arroz
- Asado Negro
- Sancocho Criollo
- Chimichurri Steak
- Carnitas Bowl
- Shrimp Ceviche

## 🛠️ Technical Details

- **Stack**: React 18, Tailwind CSS, Babel (all via CDN)
- **Storage**: localStorage for persistence
- **Deployment**: Single HTML file — just open in browser
- **PWA**: Installable on iOS/Android home screen

### File Structure

```
/
├── index.html          # The entire app (rename from nenes-kitchen-v5.html)
├── apple-touch-icon.png # App icon for iOS
└── README.md           # This file
```

## 📱 Installation

### Option 1: GitHub Pages
1. Fork this repo
2. Enable GitHub Pages in Settings
3. Visit `https://yourusername.github.io/nenes-kitchen`

### Option 2: Local
1. Download `nenes-kitchen-v5.html`
2. Rename to `index.html`
3. Open in any browser

### Add to Home Screen (iOS)
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. App works offline after first load

## 🛒 Shopping List Features

The shopping list is a standalone feature for weekly grocery runs:

- **Kitchen Essentials**: 8 protocol must-haves with smart detection
- **Manual Add**: Type anything to add
- **Quick Add**: One-tap common items
- **Categories**: Auto-sorted (Proteins, Produce, Dairy, Pantry, Other)
- **Checkboxes**: Mark items while shopping
- **Staples**: Save items you buy every week
- **Smart Share**: WhatsApp-formatted list with categories

## 💕 The Love Notes

When recipes are generated, a random love note appears. This feature was specifically requested to stay untouched — it's her favorite part of the app.

## 📝 Version History

| Version | Changes |
|---------|---------|
| V1 | Basic meal generator |
| V2 | Added recipes and navigation |
| V3 | Flavor profiles, time filters, favorites |
| V4 | Light mode redesign, performance optimization |
| **V5** | Full ingredients, meal categories, smart shopping list, kitchen essentials |

## 🙏 Credits

- Built with Claude (Anthropic)
- Recipes inspired by Diet Doctor, Gordon Ramsay, and Venezuelan home cooking
- Made with love for Nene 💕

---

*"Si me queda el six pack, te lo dedico a ti"* 🎁
