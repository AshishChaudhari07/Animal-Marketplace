import { Link } from 'react-router-dom';
import { FaPaw, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Section 1: Branding */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaPaw className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-white">AnimalHub</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A trusted marketplace to buy, sell, and adopt animals across India.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Connecting animal lovers with verified sellers and adopters nationwide.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Browse Animals
                </Link>
              </li>
              <li>
                <Link
                  to="/seller/dashboard"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  My Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-items"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Saved Items
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Cow', 'Goat', 'Horse', 'Rabbit', 'Camel', 'Donkey', 'Pig', 'Buffalo'].map(
                (category) => (
                  <li key={category}>
                    <button
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm text-left"
                      onClick={() => {
                        // Category filter would be implemented if needed
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {category}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Section 4: Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact & Follow</h4>
            
            {/* Email */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2 font-medium">Customer Support</p>
              <a
                href="mailto:support@animalhub.com"
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
              >
                <FaEnvelope size={14} />
                support@animalhub.com
              </a>
            </div>

            {/* Social Media */}
            <p className="text-gray-400 text-sm mb-3 font-medium">Follow Us</p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={18} />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Legal Footer Strip */}
        <div className="pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} Animal Marketplace. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
