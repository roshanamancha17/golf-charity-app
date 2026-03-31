## Project Description

A full-stack web application that combines golf score tracking, monthly draw-based rewards, and charity contributions in a single user experience.

The platform allows users to sign up, manage their profile, and enter their latest five golf scores (Stableford format). The system maintains only the most recent five entries, automatically replacing older scores. Based on these scores, users participate in a monthly draw where randomly generated numbers are matched against their entries to determine winnings.

A subscription system has been implemented with monthly and yearly plans. Subscription status is validated on each session, and access to core features such as score entry and draw participation is restricted for inactive users. The system also handles subscription lifecycle states including activation and expiry.

Users can select a preferred charity and define a contribution percentage, aligning with the platform’s goal of combining performance tracking with charitable impact.

## An admin panel provides full control over platform operations, including:

Generating and publishing draw results
Viewing all users and their participation
Calculating match results across all users
Identifying winners based on 3, 4, or 5 matches
Managing charity listings

The application is built with a modern UI using a responsive, gradient-based design and follows a clean, component-driven architecture.

## Tech Stack
Frontend: Next.js (App Router), React
Backend / Database: Supabase
Authentication: Supabase Auth
Styling: Tailwind CSS
Deployment: Vercel
## Key Features
User authentication (signup/login)
Rolling 5-score management system
Monthly draw generation and match logic
Subscription system (monthly/yearly with access control)
Charity selection and contribution tracking
Admin dashboard with draw control and winner insights
Responsive, modern UI
