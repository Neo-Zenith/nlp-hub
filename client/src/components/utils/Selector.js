import React, { useState } from "react";
import "../../styles/components/utils/Selector.css";

const Selector = ({ options, onSelect, defaultSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultSelect);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value) => {
        setSelectedValue(value);
        onSelect(value);
        setIsOpen(false);
    };

    return (
        <div className="custom-selector">
            <div className="selected-value" onClick={toggleDropdown}>
                {selectedValue}
                <span className={`caret ${isOpen ? "up" : "down"}`} />
            </div>
            {isOpen && (
                <ul className="selector-options">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className="selector-option"
                            onClick={() => handleOptionClick(option.value)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Selector;
