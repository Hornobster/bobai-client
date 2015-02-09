/**
 * Created by carlovespa on 04/02/15.
 */

module.exports = {
    dbInfo: {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database: 'lothar'
    },
    tokenInfo: {
        tokenDuration: 7, // in days
        jwtSecret: 'come.dovrei.nascondere.sta.roba?'
    },
    adsInfo: {
        titleMaxLength: 100,
        descriptionMaxLength: 250,
        maxDuration: 48, // in hours
        lonLatDBScale: 10000
    },
    serverInfo: {
        defaultPort: 3000
    },
    statusMessages: {
        tokenExpired: 'Token expired',
        tokenInvalid: 'Invalid token',
        tokenOrKeyInvalid: 'Invalid token or key',
        unauthorized: 'Unauthorized access',
        logoutSuccess: 'Logout successful',
        logoutFail: 'Logout failed',
        credentialsInvalid: 'Invalid credentials',
        internalError: 'Oops something went wrong!',
        dataInvalid: 'Invalid data',
        adPostSuccess: 'Ad created successfully!',
        userSignupSuccess: 'User successfully registered',
        alreadyInUse: 'Username, email or phone number already in use!'
    }
};
