# Heatmap + Leaderboard + Emergency Contacts Design

**Sub-project:** 4 of 6 (Data-Driven Pages)
**Date:** 2025-05-24
**Status:** Approved

## Overview

Wire three placeholder pages to real data: crime heatmap using post locations mapped to district coordinates, leaderboard with aggregated user scores from MongoDB, and emergency contacts organized by Bangladesh divisions. Use the `ui-ux-pro-max` skill for polished UI design during implementation.

## What Already Works

- Heatmap page exists at `app/(dashboard)/heatmap/page.tsx` with Leaflet map (SSR-safe via `next/dynamic`)
- Leaderboard page exists at `app/(dashboard)/leaderboard/page.tsx` with hardcoded data
- Emergency page exists at `app/(dashboard)/emergency/page.tsx` with hardcoded contacts
- Districts JSON at `lib/data/districts.json` includes `lat` and `lon` fields for every district
- Posts in MongoDB store `division` and `district` fields
- `useAuth()` hook available for current user identification

## What Needs Building

### 1. Crime Heatmap (Real Data)

**New API route:** `GET /api/v1/posts/locations`

Returns lightweight post location data for mapping:
```json
[
  { "district": "Dhaka", "division": "Dhaka", "count": 15 },
  { "district": "Gazipur", "division": "Dhaka", "count": 3 }
]
```

Implementation: MongoDB aggregation pipeline grouping posts by `district` + `division`, counting per group.

**New API client function:** `getPostLocations()` in `lib/api/posts.ts`.

**Page rewrite:** `app/(dashboard)/heatmap/page.tsx`
- Fetch aggregated location data from the new endpoint
- Map each district to its lat/lng from `lib/data/districts.json`
- Render circle markers on Leaflet map sized by post count (more posts = larger circle)
- Color scale from green (few) to red (many reports)
- Click marker → popup showing district name, count, link to crime feed filtered by that district
- Center map on Bangladesh (lat: 23.685, lng: 90.3563, zoom: 7)
- Loading state while data fetches

**LeafletMap component update:** `app/(dashboard)/heatmap/_components/LeafletMap.tsx`
- Accept `locations` prop with district coordinates and counts
- Render `CircleMarker` components instead of basic markers
- Add popup with district info on click

### 2. Leaderboard (Real Data)

**New API route:** `GET /api/v1/leaderboard`

Returns top contributors:
```json
[
  {
    "user_id": "uid123",
    "name": "Abrar",
    "profile_image": "/images/avatar.jpg",
    "post_count": 12,
    "comment_count": 25,
    "score": 245
  }
]
```

Implementation: Two MongoDB aggregations:
1. Group `posts` by `user_id`, count → `post_count`
2. Group `comments` by `user_id`, count → `comment_count`
3. Merge results, compute score: `post_count * 10 + comment_count * 5`
4. Join with `users` collection for name + profile_image
5. Sort by score desc, limit 20

**New API client function:** `getLeaderboard()` in `lib/api/posts.ts`.

**Page rewrite:** `app/(dashboard)/leaderboard/page.tsx`
- Fetch leaderboard data on mount
- Display ranked table/cards with position number, avatar, name, post count, comment count, score
- Highlight current user's row (if they appear in top 20)
- Loading state
- Use `ui-ux-pro-max` skill for polished design (trophy icons, medals for top 3, score badges)

### 3. Emergency Contacts (Real Data)

**New data file:** `lib/data/emergency-contacts.ts`

Static data organized by division with entries for:
- Police (999 national + local station numbers)
- Fire service
- Ambulance
- Hospitals (major hospitals per division)
- Women & child helpline
- National emergency numbers

Each entry: `{ name: string, number: string, type: "police" | "fire" | "ambulance" | "hospital" | "helpline" }`.

**Page rewrite:** `app/(dashboard)/emergency/page.tsx`
- Division selector dropdown at top (from `getDivisionsWithDistricts()`)
- Auto-detect nearest division from browser geolocation (already implemented)
- Display contacts grouped by type (Police, Fire, Ambulance, Hospitals, Helplines)
- Click-to-call buttons (`tel:` links)
- Click-to-SMS buttons (`sms:` links)
- National emergency numbers always visible at top regardless of division
- Use `ui-ux-pro-max` skill for polished design (red/orange emergency theme, clear CTAs)

## Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/api/v1/posts/locations/route.ts` | Create | Aggregated post location data |
| `app/api/v1/leaderboard/route.ts` | Create | Top contributors aggregation |
| `lib/api/posts.ts` | Modify | Add getPostLocations, getLeaderboard |
| `lib/data/emergency-contacts.ts` | Create | Bangladesh emergency contact data |
| `app/(dashboard)/heatmap/page.tsx` | Rewrite | Real data, district markers |
| `app/(dashboard)/heatmap/_components/LeafletMap.tsx` | Rewrite | Circle markers with popups |
| `app/(dashboard)/leaderboard/page.tsx` | Rewrite | Real aggregated scores |
| `app/(dashboard)/emergency/page.tsx` | Rewrite | Division-based real contacts |

## UI Design Note

Use the `ui-ux-pro-max` skill during implementation for polished UI on all three pages. Key design goals:
- Heatmap: Clean map with intuitive color scale legend
- Leaderboard: Gamified feel with medals/trophies for top 3, clear score breakdown
- Emergency: Urgent/emergency visual language, large tap targets for call buttons, accessible

## Out of Scope

- Real-time location tracking
- User-submitted emergency contacts
- Offline emergency contact access
- Post-level coordinate input (posts use district-level location)
