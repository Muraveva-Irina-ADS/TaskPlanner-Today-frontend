import React from 'react';
import '../styles/components.css';
export const HelpTip = ({ children }) => {
    return (
        <div className="help-tip-container">
            <span className="help-icon">?</span>
            <div className="help-tip-content">
                {children}
            </div>
        </div>
    );
};
export default HelpTip;