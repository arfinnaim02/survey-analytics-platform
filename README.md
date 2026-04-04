# Survey & Analytics Platform

This repository contains the source code for a premium survey and analytics platform designed for the research project **“Impact of Energy&nbsp;Crisis on Employees and Shop Owners of Supermarkets in Bangladesh.”**  The project leverages Next.js, Tailwind CSS, Framer Motion and Chart.js to deliver a clean and responsive user interface along with a robust analytics dashboard for researchers.

## Features

The system provides two separate experiences:

### Respondent

- **Landing page** with project information and a call to begin the survey.
- **Multi‑step survey** with conditional questions based on respondent role (owner/manager or employee), a progress bar and smooth animated transitions.  The Likert scale inputs are implemented as accessible, uniformly sized radio buttons that adapt from horizontal layouts on desktop to vertical layouts on mobile following guidance for responsive surveys【49881128575578†L16-L64】.
- **Thank you page** confirming successful submission.

### Admin / Researcher

- **Secure login** using a simple cookie‑based mechanism.  Environment variables can be used to configure the admin username and password.
- **Dashboard** summarizing key metrics such as total responses, role and location distributions, and composite impact scores.
- **Responses table** for browsing individual submissions.
- **Analytics pages** with charts created using Chart.js, including bar, pie and stacked Likert charts.  Analytics functions compute means, percentages, composite scores and cross‑tabulations.
- **Export** capabilities to download responses in CSV format.

## Technology Stack

- **Next.js** – a full‑stack React framework with built‑in routing and API routes for server‑side logic【136674368534281†L18-L34】.
- **Tailwind CSS** – utility‑first styling with custom colour palette matching the premium academic theme.
- **Framer Motion** – used for smooth page and element transitions to improve perceived performance.
- **Chart.js & react‑chartjs‑2** – for data visualisation.
- **PostgreSQL** – chosen as the primary database because it is a powerful, open‑source relational database system with a reputation for reliability, data integrity and extensibility【810154883315963†L37-L47】.
- **pg** – Node.js client for PostgreSQL.

## Project Structure

```
survey‑platform/
├── components/         # Reusable UI components (layout, Likert scale, progress bar)
├── lib/               # Database and analytics helper functions
├── pages/             # Next.js pages, including API routes under pages/api
│   ├── admin/
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── responses.js
│   │   └── analytics.js
│   ├── survey/index.js
│   ├── thank‑you.js
│   └── index.js
├── public/            # Static assets (e.g. logo)
├── sql/               # Database schema
├── tailwind.config.js # Tailwind configuration with custom colours
├── postcss.config.js  # PostCSS configuration
├── next.config.js     # Next.js configuration
└── .env.example       # Environment variable template
```

## Database Schema

The project includes an SQL file (`sql/schema.sql`) defining the structure of the `responses` table used to store survey submissions.  Fields cover respondent type, location and each survey question, matching the provided questionnaire structure.  PostgreSQL supports a broad range of built‑in data types and ensures strong data integrity and scalability【810154883315963†L37-L53】.

## Running Locally

1. Install dependencies and set up the project:

   ```bash
   cd survey‑platform
   npm install
   cp .env.example .env
   # Edit .env to configure your database connection and admin credentials
   ```

2. Create the PostgreSQL database and run the schema:

   ```bash
   createdb survey_db
   psql -d survey_db -f sql/schema.sql
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.  Navigate to `/survey` to fill out the questionnaire or `/admin/login` to access the admin dashboard.

## Notes

- Authentication uses a simple cookie system for demonstration.  For a production deployment you should integrate a more robust authentication strategy (e.g. NextAuth.js).
- The `lib/db.js` file exports helper functions that use the `pg` library to connect to PostgreSQL.  If you prefer a different ORM or query builder you can replace this implementation.
- Charts are built with Chart.js and configured to match the premium, minimal aesthetic described in the project brief.  The design draws inspiration from luxury analytics dashboards that emphasise refined colour palettes and smooth interactions【567467114158853†L42-L77】.

## License

This project is intended for academic research and demonstration purposes.  Feel free to use and adapt the code for your own studies.