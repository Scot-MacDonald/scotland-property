# Scotland Luxury Estates

## Project Status (July 2026)

## Overall Vision

Build Scotland's premium luxury property portal using Payload CMS and Next.js.

The aim is to combine the best ideas from JamesEdition, Sotheby's International Realty and Rightmove while remaining Scotland-only.

---

# Tech Stack

- Payload CMS v3
- Next.js 16
- TypeScript
- MongoDB
- TailwindCSS

---

# Public Website Status

## Homepage

Completed

Features:

- Luxury hero
- Search autocomplete
- Statistics
- Featured properties
- Property map
- Featured agencies
- Saved links
- Reusable PropertyCard component

Performance improvements:

- Reduced Property query depth
- Homepage reduced from ~7 seconds to ~2.7 seconds

---

## Property Cards

Completely redesigned.

Reusable everywhere.

Features:

- Image slider
- Save button
- Featured badge
- Sold / Under Offer badges
- Agency logo
- Property meta
- Consistent typography

Save button improvements:

- Heart icon
- Guest localStorage fallback
- Buyer account support
- Animated "✓ Saved" confirmation
- Styled to match luxury design

---

## Property Page

Major refactor completed.

Components:

PropertyGallery

PropertyDetails

PropertyDescription

PropertyFeatures

PropertyAmenities

PropertySidebar

Features:

- Sticky sidebar
- Contact form
- Agent card
- Agency card
- Similar Properties
- Virtual Tour
- Video links

---

## Similar Properties

Implemented.

Uses PropertyCard.

Editorial heading:

Highland Collection

More Exceptional Homes

Shows:

2 similar properties

instead of 3.

---

## Agency Page

Large improvements.

Completed:

Luxury hero

Large logo

Statistics

About section

Contact sidebar

Meet the Team

Featured Properties

PropertyCard reused for listings.

Future improvements:

Office locations

Awards

Reviews

Video

History timeline

Premium branding options

---

## Buyer Features

Working

Saved Properties

Recently Viewed

Saved Searches

Buyer accounts

Property enquiries

---

## CRM

Working

Agency XML imports

Automatic property creation

Automatic updates

Automatic agent creation

Automatic amenities matching

Scheduled imports

Image deduplication

---

## Dashboard

Current

Editable dashboard

No longer relying on Payload CMS for many tasks.

Long term goal:

Everything editable without visiting Payload Admin.

---

# Refactoring

Completed

PropertyCard

Property page

Reusable components

Agency listings

Cleaner codebase

Much less duplication

---

# Design Philosophy

The site should feel like:

JamesEdition

Sotheby's

Christie's

Luxury Portfolio

Not:

Typical property portal

Every page should feel editorial.

Examples:

Highland Collection

Exceptional Homes

Featured Properties

Luxury typography

Large imagery

Minimal UI

---

# Current Roadmap

## Phase 1

Public Website

✅ Homepage

✅ Property page

✅ Agency page

✅ Search

✅ Maps

✅ Save properties

✅ Similar properties

---

## Phase 2

Agency Dashboard

Everything editable

Property management

Agent management

Leads

Settings

Analytics

CRM management

---

## Phase 3

Buyer Experience

Property compare

Saved searches

Alerts

Collections

Recently viewed

Property enquiry history

---

## Phase 4

Agency Premium Features

Awards

Office locations

Videos

Reviews

Custom branding

Featured agencies

Premium subscriptions

---

## Phase 5

Launch

Payments

Subscriptions

Production deployment

SEO

Marketing

---

# Immediate Next Task

Build Dashboard V2.

Goal:

An agency should never need to visit Payload Admin.

Dashboard should manage:

Properties

Agents

Leads

Settings

CRM

Media

Everything from one branded interface.

---

# Important Coding Rules

Keep components small.

Refactor before duplication.

Reuse PropertyCard everywhere.

Luxury design over clutter.

Performance before features.

Never break existing layouts.

Always build idiot-proof step by step.
