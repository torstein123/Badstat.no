import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faTag, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';

const Blog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Sample blog posts data (in a real app, this would come from an API/database)
    const blogPosts = [
        {
            id: 1,
            title: 'Din første badmintonturnering: Hva du bør vite',
            excerpt: 'Her kommer noen nyttige tips for deg som skal delta i din første badmintonturnering - fra påmelding til oppvarming og kampforberedelser.',
            content: 'Full artikkel om hvordan du kan forberede deg til din første badmintonturnering...',
            author: 'Torstein Vikse Olsen',
            date: '2025-04-20',
            image: 'https://images.unsplash.com/photo-1599391398131-cd12dfc6c24e?q=80&w=2622&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            category: 'trening'
        }
    ];
    
    const categories = [
        { id: 'all', name: 'Alle kategorier' },
        { id: 'trening', name: 'Trening og teknikk' }
    ];

    useEffect(() => {
        let result = blogPosts;
        
        // Filter by search term
        if (searchTerm) {
            result = result.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(post => post.category === selectedCategory);
        }
        
        setFilteredPosts(result);
    }, [searchTerm, selectedCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-7xl mx-auto py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            BadStat Blogg
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Nyheter, analyser og innsikt fra norsk badminton
                    </p>
                </div>
                
                {/* Search and filter */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            className="bg-white/10 border border-indigo-500/20 rounded-lg px-4 py-2 pl-10 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Søk i blogginnlegg..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                    
                    <div className="w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white/10 border border-indigo-500/20 rounded-lg px-4 py-2 w-full md:w-auto text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Blog posts grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <Link 
                                key={post.id}
                                to={`/blogg/${post.id}`}
                                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={post.image} 
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center text-xs text-gray-400 mb-2 space-x-4">
                                        <span className="flex items-center">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-indigo-400" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center">
                                            <FontAwesomeIcon icon={faUser} className="mr-1 text-indigo-400" />
                                            {post.author}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">
                                            <FontAwesomeIcon icon={faTag} className="mr-1" />
                                            {categories.find(c => c.id === post.category)?.name || post.category}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-300 text-sm mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="inline-flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                                        Les mer
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-8">
                            <p className="text-gray-300 text-lg">Ingen blogginnlegg funnet. Prøv et annet søk.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blog; 