# SETUP AND EXEC
1. Install [Node.js](https://nodejs.org/en/download) and [PHP](https://www.php.net/downloads.php)
2. Run `npm run setup`
3. Run `npm run dev`
4. Open `http://localhost:3000/`

# TEST CREDENTIALS 
> [!NOTE]
> i'm including the db para lang 'di paulit-ulit creation ng test accounts. DB will be deleted (reset) 'pag ipapasa na.

Format: [email] [password]
- `admin@admin.its admin`
- `polgabriel09@gmail.com admin`
- `test@test.its test`

# NOTES 
> [!NOTE]
> `//comment` at the end is priority level

### ADMIN:
- ~~should see all reservations regardless of acct // high~~
- existing reservations cannot be reviewed for changes (or removed for cancellation) // high
- new reservations (for hypothetical in-person inquiry) // optional 

### CLIENT:
- new reservation does not include other fields (only SPACE selection working) // high
- request reservation info change // mid
- reservation notif of BOOKED reservation via email (like a receipt) // optional
- reservation notif of APPROVED reservation via email // optional
- reservation reminder/alert via email ("Reminder that tomorrow is your ...") // optional

### BOTH:
- filter based on space, date range (from _ to _) // optional

### GENERAL:
- no persistent session (when refreshing, goes back to LANDING) // high
- password complexity // high
- email verif // high
- refresh inputs in LANDING page // mid
