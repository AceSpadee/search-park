// fix this endpoint later =====================================================
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import Error from './endpoints/Error';
import Home from './endpoints/Home';
import Book from './endpoints/Book';


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                // change this endpoint
                path: '/book-massage',
                element: <Book />,
            },
        ],
    },
]);

export default router;