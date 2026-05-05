import { Fragment, createContext, useContext, useState } from 'react';
import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';

const DropdownContext = createContext();

export default function Dropdown({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div className="relative">{children}</div>
        </DropdownContext.Provider>
    );
}

Dropdown.Trigger = ({ children }) => {
    const { open, setOpen } = useContext(DropdownContext);

    return (
        <>
            <div onClick={() => setOpen(!open)}>{children}</div>
            {open && (
                <div className="fixed inset-0" onClick={() => setOpen(false)} />
            )}
        </>
    );
};

Dropdown.Content = ({ children }) => {
    const { open } = useContext(DropdownContext);

    return (
        <Transition
            as={Fragment}
            show={open}
            enter="transition duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
        >
            <div className="absolute z-50 mt-2 w-48 bg-white shadow rounded">
                {children}
            </div>
        </Transition>
    );
};

Dropdown.Link = ({ children, ...props }) => {
    return (
        <Link {...props} className="block px-4 py-2 hover:bg-gray-100">
            {children}
        </Link>
    );
};