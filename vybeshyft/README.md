# VibeShift - Addiction Recovery Social Platform

VibeShift is a supportive social media platform designed specifically for people in addiction recovery. The platform provides a safe space for users to connect, share their experiences, and support each other through their recovery journey.

## Features

- **User Authentication**: Secure sign-up and login using Supabase authentication
- **Profile Management**: Customize your profile with pictures and recovery milestones
- **Feed**: Post updates, images, and follow other users' journeys
- **Comments & Likes**: Engage with content through comments and likes
- **Success Stories**: Share and browse inspiring success stories from the community
- **SOS Button**: Emergency support feature for users in crisis
- **User Blocking**: Block unwanted interactions for a safer experience

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Deployment**: [TBD]

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/eyecrackcodes/vibeshiftmay.git
   cd vibeshiftmay
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Run the SQL scripts in the Supabase SQL Editor to create the necessary tables

5. Start the development server:
   ```
   npm run dev
   ```

## Database Setup

Run the following SQL files in your Supabase SQL Editor to set up the required tables:
- `sos_requests_table.sql` - For the SOS emergency help feature

## Contributing

We welcome contributions to VibeShift! Please feel free to submit pull requests or open issues to improve the platform.

## License

[MIT License](LICENSE)
