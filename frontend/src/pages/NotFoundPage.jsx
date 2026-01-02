import {useEffect} from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {

    useEffect(() => {
        document.title = "404 Not Found";
    }, []);
    return (
        <div className="login-page-wrapper">
            <div className="login-container">

                <div className="header">
                    <h1 className="app-title">404</h1>
                </div>

                <p className="login-text">
                   Not found
                </p>

                <div className="error-message">
                   This URL does not exist or the site was taken down
                </div>

                <div className="login-form">
                    <Link to="/" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <button> Return to main page
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default NotFoundPage;
