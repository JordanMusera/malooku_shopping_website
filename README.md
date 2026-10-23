MALOOKU SHOPPING WEBSITE

PROJECT OVERVIEW

Malooku is an online shopping website. Customers can browse products, add items to their shopping bag, pay using M-Pesa, track orders, save favourites, and write product reviews. Customers can also manage their profile, addresses, orders, cancellations, and refund requests.

Store administrators can manage products, customers, orders, payments, and refunds. The first administrator account can be set up when the store does not yet have an administrator.

TECHNOLOGIES AND LIBRARIES

Next.js is used to build the website pages and server API. React and TypeScript are used to create the user interface and application code.

MongoDB stores the application data. Mongoose connects the application to MongoDB and defines the data models.

Redux Toolkit and React Redux manage shared information such as the shopping bag and account state.

Safaricom Daraja is used for M-Pesa STK Push payments and payment callbacks. Nodemailer sends signup verification codes and password reset codes through an SMTP email account. Cloudinary stores product images.

Ant Design provides interface components. React Icons provides icons, and React Toastify displays notifications. Bcrypt hashes passwords. Jose and JsonWebToken handle signed login tokens.

REQUIREMENTS

The project requires Node.js version 20 or later, npm, and a MongoDB database. Email delivery requires an SMTP account. Product image uploads require Cloudinary credentials. M-Pesa payments require Safaricom Daraja credentials and a public HTTPS callback address.

RUNNING THE PROJECT

Install the project packages with the command: npm install

Copy the file named .env.example to a new file named .env.local. Add the correct values for your database and any services you use. Keep .env.local private and do not add it to source control.

Start the development website with the command: npm run dev

Open http://localhost:3000 in a browser.

To create a production build, run npm run build. To start the production build, run npm run start. To run the configured lint command, run npm run lint.

CONFIGURATION

The .env.example file lists the settings used by the project. These include the MongoDB connection string, JWT signing secret, M-Pesa credentials, Cloudinary credentials, SMTP sender details, and the secret used to protect email verification codes.

The example M-Pesa settings use sandbox mode and KSh 1 test payments. M-Pesa callbacks need a public HTTPS address. Gmail SMTP can use smtp.gmail.com on port 465 or port 587, with a Google app password as the SMTP password.

Email verification and password reset codes expire after 10 minutes. A new code can be requested after one minute. Keep all database URLs, passwords, API keys, and signing secrets private.

For a deployed website, configure the required settings in the hosting provider's environment settings. The production email and payment features will not work until their settings are configured.

PROJECT FILES

Website pages, components, API routes, database models, and shared application logic are in the src folder. Redux state files are in src/store. Local diagnostic scripts are in the scripts folder. The .env.example file is the configuration template.

DEPLOYMENT

The project can be deployed to Vercel. Configure the production environment settings before deployment. M-Pesa requires a public HTTPS callback address. Signup verification and password reset email require SMTP settings.
