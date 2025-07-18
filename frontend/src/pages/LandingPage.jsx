import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Users, 
  MessageCircle, 
  Highlighter, 
  Share2, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Eye,
  Zap,
  Globe,
  Shield,
  Star,
  Play,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Edit3 className="h-8 w-8 text-[#575757]" />,
      title: "Rich Text Editing",
      description: "Powerful editor with formatting, tables, images, and more"
    },
    {
      icon: <Users className="h-8 w-8 text-[#575757]" />,
      title: "Real-time Collaboration",
      description: "See live cursors, edits, and presence of your team members"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-[#575757]" />,
      title: "Persistent Comments",
      description: "Add contextual comments that stay with your document"
    },
    {
      icon: <Highlighter className="h-8 w-8 text-[#575757]" />,
      title: "Tagged Highlights",
      description: "Organize highlights with custom tags for easy navigation"
    },
    {
      icon: <Share2 className="h-8 w-8 text-[#575757]" />,
      title: "Smart Sharing",
      description: "Role-based access control with admin, editor, and viewer permissions"
    },
    {
      icon: <Clock className="h-8 w-8 text-[#575757]" />,
      title: "Auto-Save",
      description: "Never lose your work with intelligent auto-save functionality"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Manager",
      content: "This editor has transformed how our team collaborates. The real-time features make remote work feel seamless.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Technical Writer",
      content: "The tagged highlights and persistent comments are game-changers for our documentation process.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Marketing Director",
      content: "Beautiful interface and powerful collaboration features. Our team productivity has increased by 40%.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F1E8] via-[#D8C9AE] to-[#F4F1E8]">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-[#D8C9AE]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#575757] rounded-lg flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#575757]">CollabDocs</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[#575757] hover:text-[#D8C9AE] transition-colors">Features</a>
              <a href="#testimonials" className="text-[#575757] hover:text-[#D8C9AE] transition-colors">Testimonials</a>
              <a href="#pricing" className="text-[#575757] hover:text-[#D8C9AE] transition-colors">Pricing</a>
              <button
                onClick={() => navigate('/login')}
                className="text-[#575757] hover:text-[#D8C9AE] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-[#575757] text-white px-6 py-2 rounded-lg hover:bg-[#404040] transition-colors flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[#575757] hover:text-[#D8C9AE] transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-[#D8C9AE]/30">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-[#575757] hover:text-[#D8C9AE] transition-colors">Features</a>
              <a href="#testimonials" className="block text-[#575757] hover:text-[#D8C9AE] transition-colors">Testimonials</a>
              <a href="#pricing" className="block text-[#575757] hover:text-[#D8C9AE] transition-colors">Pricing</a>
              <button
                onClick={() => navigate('/login')}
                className="block w-full text-left text-[#575757] hover:text-[#D8C9AE] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-[#575757] text-white px-6 py-2 rounded-lg hover:bg-[#404040] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#575757]">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Revolutionary Collaboration</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-[#575757] leading-tight">
                  Write Together,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8C9AE] to-[#B8A082]">
                    {" "}Create Magic
                  </span>
                </h1>
                <p className="text-xl text-[#575757]/80 leading-relaxed">
                  Experience the future of collaborative writing with real-time editing, 
                  smart comments, tagged highlights, and seamless team synchronization.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-[#575757] text-white px-8 py-4 rounded-lg hover:bg-[#404040] transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span className="text-lg font-semibold">Start Collaborating</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border-2 border-[#575757] text-[#575757] px-8 py-4 rounded-lg hover:bg-[#575757] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span className="text-lg font-semibold">Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-[#575757]/60">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">10k+ Teams</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">50+ Countries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm">4.9 Rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D8C9AE] to-[#B8A082] rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-[#D8C9AE]/30">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxjb2xsYWJvcmF0aW9ufGVufDB8fHx8MTc1Mjg0MDQyNHww&ixlib=rb-4.1.0&q=85"
                  alt="Team collaboration"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-[#575757] text-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">3 users editing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#575757] mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-[#575757]/70 max-w-2xl mx-auto">
              Everything you need to collaborate effectively and create amazing content together
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#D8C9AE]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-[#D8C9AE]/20 rounded-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#575757]">{feature.title}</h3>
                </div>
                <p className="text-[#575757]/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#575757] mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-[#575757]/70 max-w-2xl mx-auto">
              See what our users say about their collaborative writing experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#D8C9AE]/30">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[#575757]/80 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#575757] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#575757]">{testimonial.name}</p>
                    <p className="text-sm text-[#575757]/60">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#575757] to-[#404040]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team's Collaboration?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using CollabDocs to create amazing content together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-[#D8C9AE] text-[#575757] px-8 py-4 rounded-lg hover:bg-[#C5B896] transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg text-lg font-semibold"
            >
              <span>Start Your Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-[#575757] transition-all duration-300 flex items-center justify-center space-x-2 text-lg font-semibold">
              <span>Schedule Demo</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#575757] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#D8C9AE] rounded-lg flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-[#575757]" />
                </div>
                <span className="text-xl font-bold">CollabDocs</span>
              </div>
              <p className="text-white/70">
                The future of collaborative writing and team productivity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 CollabDocs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;