# :speech_balloon: Chat Application

This project is a chat application with real-time messaging capabilities. Users can add their coworkers or friends and communicate with them.

## Technologies

### Backend

- **Prisma ORM**: Used for database management.
- **PostgreSQL**: The database used, hosted on Supabase.
- **Cloudinary**: Used for user uploads (images and media).
- **Socket.IO**: Used for real-time events.
- **bcrypt**: Used for user password security.
- **Express**: Used for the API service.
- **jsonwebtoken**: Used for user authentication.
- **nodemailer**: Used for email services.

### Frontend

- **React.js**: Used for building the user interface.
- **Vite**: Used for the development and build process.
- **Material UI**: Used for styling and components.
- **Pure CSS**: Used for custom styling and utility classes.
- **Socket.IO Client**: Used for handling real-time data on the client side.
- **Axios**: Used for making API calls.
- **crypto-js**: Used for securely storing sensitive information on the client side.

## Features

- Users can add friends or coworkers.
- Users can chat with their added friends in real-time.
- The application is fully responsive and optimized for all devices and screen sizes.
- Users can upload profile pictures via Cloudinary.
- Secure authentication and password storage are implemented.
- Email verification and notifications are provided.

## Installation

### Backend Setup

1. **Install Backend Dependencies**:

   ```bash
   cd socket_server
   npm install
   ```

2. **Configure Environment Variables**: Create a `.env` file and add the required configuration details.

3. **Database Setup**:

   - **Supabase**: You can use Supabase to host your PostgreSQL database. Create a PostgreSQL database on Supabase and add the connection details to the `.env` file.
   - **Local**: Alternatively, you can set up a PostgreSQL database locally. Use pgAdmin or a similar tool to manage the database and update the connection details in the `.env` file.

4. **Start the Server**:
   ```bash
   node server.js
   ```

### Frontend Setup

1. **Install Frontend Dependencies**:

   ```bash
   cd client
   npm install
   ```

2. **Configure Environment Variables**: Create a `.env` file and add the required configuration details.

3. **Start the Application**:
   ```bash
   npm run dev
   ```

## Usage

- **Register and Login**: Users can create a new account or log in with existing credentials.
- **Add Friends and Coworkers**: Users can search for and add both friends and coworkers.
- **Real-Time Chat**: Communicate with added friends in real-time.
- **Profile Management**: Users can update their profile pictures.

## Contributing

If you would like to contribute, please submit a pull request or open an issue.

## Contact

For questions or feedback, please contact [ayktkav@gmail.com](mailto:ayktkav@gmail.com).
