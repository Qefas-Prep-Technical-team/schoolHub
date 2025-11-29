import React from "react";
import "./lucidLoader.css";

const LucidLoader = () => {
    return (
        <div className="lucid-loader-container">
            <div className="lucid-loader"></div>
            <p className="lucid-text">Loading...</p>
        </div>
    );
};

export default LucidLoader;
