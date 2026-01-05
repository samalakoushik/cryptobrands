# Crypto Brands' X Affiliate Spends

A desktop website that tracks and displays how much crypto brands spend on X (Twitter) affiliate badges and Gold subscriptions.

## Features

- **Homepage**: Search and browse crypto brands with modal popups
- **Search Functionality**: Real-time search with autocomplete and brand logos
- **Sort Options**: Sort by highest/lowest spend or A-Z alphabetically
- **Brand Modal**: Detailed cost breakdown in popup modal
- **Admin Dashboard**: Password-protected admin panel for data entry
- **Image Upload**: Upload brand logos with automatic compression
- **X Theme**: Black and white design matching X's aesthetic
- **Glossy Search Bar**: Modern glassmorphism effect with search icon

## Cost Structure

- **X Gold Subscription**: $1,000 per month
- **Affiliate Badges**: $50 per person

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Brands (Admin)

1. Navigate to the Admin page
2. Fill in the form:
   - Brand Name (required)
   - X Username (required)
   - Number of Affiliate Badges (required)
   - X Profile Link (optional)
3. Click "Add Brand"

### Viewing Brands

- Use the search bar to find brands by name or username
- Click on any brand card to see detailed cost breakdown
- Use sort buttons to organize brands by different criteria

## Data Storage

Brand data is stored in browser localStorage, so it persists across sessions.

## Technologies

- React 18
- React Router DOM
- CSS3 with glassmorphism effects
- Montserrat font family

