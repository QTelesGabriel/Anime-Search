import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import AnimeCarousel from '../components/AnimeCarousel';
import '../styles/categorie.css';

const Profile = () => {
    const animes = [
        { 
            title: 'Haikyuu!', 
            image: 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781421587660/haikyu-vol-1-9781421587660_hr.jpg' 
        },
        { 
            title: 'Naruto', 
            image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg' 
        },
        { 
            title: 'Attack on Titan', 
            image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' 
        },
        { 
            title: 'One Piece', 
            image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg' 
        },
        { 
            title: 'Demon Slayer', 
            image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' 
        },
        { 
            title: 'My Hero Academia', 
            image: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg' 
        },
        { 
            title: 'Jujutsu Kaisen', 
            image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' 
        },
        { 
            title: 'Tokyo Revengers', 
            image: 'https://th.bing.com/th/id/OIP.wasvqJezWrh7IyAUpvgE0wHaLH?rs=1&pid=ImgDetMain' 
        },
        { 
            title: 'Haikyuu!', 
            image: 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781421587660/haikyu-vol-1-9781421587660_hr.jpg' 
        },
        { 
            title: 'Naruto', 
            image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg' 
        },
        { 
            title: 'Attack on Titan', 
            image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' 
        },
        { 
            title: 'One Piece', 
            image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg' 
        },
        { 
            title: 'Demon Slayer', 
            image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' 
        },
        { 
            title: 'My Hero Academia', 
            image: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg' 
        },
        { 
            title: 'Jujutsu Kaisen', 
            image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' 
        },
        { 
            title: 'Tokyo Revengers', 
            image: 'https://th.bing.com/th/id/OIP.wasvqJezWrh7IyAUpvgE0wHaLH?rs=1&pid=ImgDetMain' 
        }
    ]

    return (
        <>
            <Header /> 
            <SearchBar /> 
            <div className="categorie">
                <h2 className="title">Your List</h2>
                <div className="options">
                    <Link to='/' className="option">Add Anime to List</Link>
                    <Link to='/' className="option">Filter Anime List</Link>
                </div>
            </div>
            <AnimeCarousel animes={animes} />
            <div className="categorie">
                <h2 className="title">Recommended For You</h2>
                <Link to='/' className="option">Filter Recommendations</Link>
            </div>
            <AnimeCarousel animes={animes} />
        </>
    )
}

export default Profile;