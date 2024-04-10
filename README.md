# LearnAPI Documentation

## Introduction

LearnAPI is an API designed to support a Learning Management System (LMS) integrated into the ProGrowing mentorship web platform. It facilitates the management of courses, categories, user enrollments, quizzes, submissions, reviews, and more. Built with TypeScript, Node.js, Express, MongoDB, and Cloudinary, LearnAPI provides a robust backend solution for educational platforms.

## Features

- **User Management**: Allows registration and login of users, including students and administrators.
- **Course Management**: Enables the creation, retrieval, update, and deletion of courses.
- **Category Management**: Supports the creation and retrieval of course categories.
- **Enrollment Management**: Facilitates the enrollment of users in courses.
- **Quiz Management**: Allows the creation and retrieval of quizzes for courses.
- **Submission Management**: Supports the submission of quiz answers by users.
- **Review Management**: Enables users to submit reviews for courses.
- **Module Management**: Facilitates the creation and retrieval of course modules.
- **Password Complexity**: Implements password complexity rules for user registration.
- **Image Uploads**: Allows users to upload images for profile pictures using Cloudinary.

## Installation

To install LearnAPI, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/oduyemi/LearnAPI.git
   ```

2. Navigate to the project directory:

   ```bash
   cd LearnAPI
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Define the following environment variables:

     ```plaintext
     PORT=3000
     MONGODB_URI=<your MongoDB connection URI>
     JWT_SECRET=<My JWT secret key>
     CLOUDINARY_NAME=<My Cloudinary cloud name>
     CLOUDINARY_API_KEY=<My Cloudinary API key>
     CLOUDINARY_API_SECRET=<My Cloudinary API secret>
     ```

5. Run the application:

   ```bash
   nodemon src/index.js
   ```

## Usage

LearnAPI provides RESTful endpoints for various operations. Here are some of the key endpoints:

- `/users/register`: Register a new user.
- `/users/login`: Log in an existing user.
- `/admin/register`: Register a new administrator.
- `/admin/login`: Log in an existing administrator.
- `/courses`: Retrieve all courses.
- `/courses/:courseId`: Retrieve a specific course by ID.
- `/categories`: Retrieve all categories.
- `/categories/:categoryId`: Retrieve a specific category by ID.
- `/enrollments`: Retrieve all enrollments.
- `/enrollments/:enrollmentId`: Retrieve a specific enrollment by ID.
- `/quizzes`: Retrieve all quizzes.
- `/quizzes/:quizId`: Retrieve a specific quiz by ID.
- `/reviews`: Retrieve all reviews.
- `/reviews/:reviewId`: Retrieve a specific review by ID.
- `/submissions`: Retrieve all submissions.
- `/submissions/:submissionId`: Retrieve a specific submission by ID.

## Technologies Used

- TypeScript
- Node.js
- Express
- MongoDB
- Cloudinary

## Contributing

Contributions to LearnAPI are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or support, please contact the project maintainer at hello@yemi.dev](mailto:hello@yemi.dev).

---

Thank you for using LearnAPI! I hope it helps you build amazing educational platforms.
