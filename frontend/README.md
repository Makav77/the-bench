Dans le dossier frontend/

=> npm install react-router-dom
=> npm install @types/react-router-dom
=> npm install i18next-http-backend
=> npm install tailwindcss
=> npm install uuid


Avant chaque commit :
npm run lint
npm run format

--------------------------------------------------

Features:

Register page :

firstname, lastname, email, password and date of birth fields
register and cancel button (cancel button to return to the login page)
show/hide password button + toggle visibility with space bar
simple error handling => invalid credentials / missing credentials / unknow error (fields shake and border turns red)
spin animation on register button when submit
add internationalization (en/fr)
