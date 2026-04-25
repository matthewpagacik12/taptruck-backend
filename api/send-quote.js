require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const xoauth2 = require('xoauth2');
const CLIENTS = require('../config/clients');

const app = express();
const PORT = 3000;

const allowedOrigins = [
  'https://taptruck-quote-site.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an origin (curl, Postman, server-to-server).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// POST route to handle form submission
app.post('/api/send-quote', async (req, res) => {
  const { clientId, email, packageSelect, numberOfGuests, bartendingHours, truckRentalHours, mileage, state, salesTaxRate, additionalNotes, totalBeforeTax, totalAfterTax } = req.body;
  const resolvedClientId = clientId || 'taptruckct';
  const client = CLIENTS[resolvedClientId];

  if (!client) {
    return res.status(400).send('Invalid client');
  }

  const date = new Date().toLocaleDateString();

  const pkg = client.packages.find(p => p.value === packageSelect);
  if (!pkg) {
    return res.status(400).send('Invalid package selection');
  }
  const packageUnitPrice = pkg.price;
  const packageLabel = pkg.label;

  const { bartending: bartendingRate, bartendingLabel, mileage: mileageRate, freeMiles, truckRental: truckRentalRate } = client.rates;
  const truckRentalHoursInt = parseInt(truckRentalHours) || 0;
  const calculatedMileageCharge = mileage > freeMiles ? (mileage - freeMiles) * mileageRate : 0;
  const bartendingCharge = bartendingHours * bartendingRate;
  const truckRentalCharge = truckRentalHoursInt * truckRentalRate;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: client.emailUser,
      pass: client.emailPass,
    },
  });

  const recipientList = [...new Set([
    email,
    client.businessEmail,
    client.emailUser,
  ].filter(Boolean))].join(', ');

  // Email content
  let mailOptions = {
    from: client.name,
    to: recipientList,
    subject: `${client.name} Quote`,
    html: `
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        .invoice {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          color: #000000;
        }

        .invoice-header p {
          margin: 5px 0;
        }

        .invoice-header-left, .invoice-header-right {
          flex: 1;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .invoice-table th, .invoice-table td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }

        .invoice-table th {
          background-color: #5c819d;
          color: #fff;
          font-weight: bold;
        }

        .invoice-total {
          text-align: right;
        }

        .invoice-total p {
          font-weight: bold;
          margin: 5px 0;
        }

        .invoice-footer {
          color: #000000;
        }
      </style>

        </head>
        <body>
           <div class="invoice">
        <div class="invoice-header">
            <div class="invoice-header-left">
            <img src="${client.logo}" alt="${client.name} Logo" width="150">
            <h1>${client.name}</h1>
            <p>Email: ${client.businessEmail}</p>
                ${client.phone ? `<p>Phone: ${client.phone}</p>` : ''}
                <p>***Final price may vary pending final selections***
            </div>
            <div class="invoice-header-right">
                <h2>Quote</h2>
                <p>Date: ${date}</p>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Drinks</th>
                    <th>Guests</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${packageLabel}</td>
                    <td>${numberOfGuests}</td>
                    <td>$${packageUnitPrice}/person</td>
                    <td>$${numberOfGuests * packageUnitPrice}</td>
                </tr>
              <thead>
                <tr>
                    <th>Bartending</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
              </thead>
                <tr>
                    <td>${bartendingLabel}</td>
                    <td>${bartendingHours}</td>
                    <td>$${bartendingRate}/hour</td>
                    <td>$${bartendingCharge}</td>
                </tr>
                ${truckRentalCharge > 0 ? `
                <tr>
                    <td>Truck Rental</td>
                    <td>${truckRentalHoursInt}</td>
                    <td>$${truckRentalRate}/hour</td>
                    <td>$${truckRentalCharge}</td>
                </tr>` : ''}
                <tr>
                    <td>Mileage Charge${freeMiles > 0 ? ` (First ${freeMiles} Miles Free)` : ''}</td>
                    <td>${mileage}</td>
                    <td>${freeMiles > 0 ? `$${mileageRate}/mile over ${freeMiles} miles` : `$${mileageRate}/mile`}</td>
                    <td>$${calculatedMileageCharge}</td>
                </tr>
            </tbody>
                <thead>
                <tr>
                    <th>Additional Notes</th>
                </tr>
              </thead>
                <tr>
                    <td>${additionalNotes}</td>
                </tr>
     
        </table>

        <div class="invoice-total">
                <p><strong>${state} Sales Tax Rate:</strong> ${(salesTaxRate * 100).toFixed(2)}%</p>
            <p><strong>Subtotal:</strong> $${totalBeforeTax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${totalAfterTax.toFixed(2)}</p>
        </div>

        <div class="invoice-footer">
            <p>Great drinks and a well-crafted experience leave a lasting impression, cheers!</p>
        </div>
    </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Quote sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    clients: Object.keys(CLIENTS),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
