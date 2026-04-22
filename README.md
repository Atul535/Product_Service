# Product Management API

A robust Node.js and Express API for managing products with full CRUD operations, JWT authentication, image uploads, and advanced search/pagination features.

## 🚀 Getting Started

### 1. Installation
Run the following commands to set up the project dependencies:
```powershell
npm init -y
npm install express @prisma/client@5 dotenv jsonwebtoken bcryptjs multer cors
npm install -D prisma@5 nodemon
```

### 2. Database Setup
Initialize Prisma and sync the database schema:
```powershell
# Initialize Prisma (if not already done)
npx prisma init

# Create the SQLite database and tables
npx prisma migrate dev --name init

# Generate the Prisma Client
npx prisma generate
```

### 3. Folder Setup
Manually create the directory for storing product images:
```powershell
mkdir uploads
```

### 4. Environment Variables (.env)
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key_here"
PORT=3000
```

---

## 🛠️ API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Login and receive a JWT token |

### Products
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | Fetch all products (supports search/pagination) | No |
| POST | `/api/products` | Create a new product (with image upload) | **Yes** |
| PUT | `/api/products/:id` | Update an existing product | **Yes** |
| DELETE | `/api/products/:id` | Soft-delete a product | **Yes** |

---

## 🧪 Testing with Postman

### How to Create a Product (with Image)
1. Set the method to **POST** and URL to `http://localhost:3000/api/products`.
2. In the **Auth** tab, select **Bearer Token** and paste your login token.
3. In the **Body** tab, select **form-data**.
4. Add the following keys (ensure NO quotes are used in keys):
   - `name` (Text)
   - `price` (Text)
   - `quantity` (Text)
   - `manufacturedDate` (Text - format: YYYY-MM-DD)
   - `image` (Change type to **File** and upload an image)

### How to use Pagination & Search
Send a **GET** request to `/api/products` with query parameters:
- `?name=Smart` (Search by name)
- `?page=1&limit=5` (Pagination)
- `?minPrice=100&maxPrice=1000` (Filter by price)

---

## 📜 Procedures Followed
1. **Project Initialization**: Initialized npm and installed Express/Prisma.
2. **Schema Design**: Defined `User` and `Product` models in Prisma.
3. **Authentication**: Implemented JWT-based secure login and registration.
4. **CRUD Operations**: Built APIs for managing product data with soft-deletion.
5. **Image Upload**: Integrated Multer for local file storage.
6. **Advanced Features**: Added pagination, name-based search, and price filtering.
7. **Transactions**: Wrapped critical database operations in Prisma `$transaction` for safety.
