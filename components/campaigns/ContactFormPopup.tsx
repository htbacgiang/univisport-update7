import React from "react";
import ContactForm, { ContactFormProps } from "../header/ContactForm";

export type ContactFormPopupProps = ContactFormProps;

/**
 * ContactFormPopup đồng bộ 100% với ContactForm (Single Source of Truth)
 */
export const ContactFormPopup: React.FC<ContactFormPopupProps> = (props) => {
  return <ContactForm isModal={true} {...props} />;
};

export default ContactFormPopup;
