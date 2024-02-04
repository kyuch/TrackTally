import {useEffect, useState} from "react";
import './App.css';
import profile_pic from './/images/profile.png';
import spotify_logo from './/images/spotify-api.png'

function App() {
    const CLIENT_ID = "fb16e1064e7746ba8578ae848092e02f";
    const REDIRECT_URI = "https://kyuch.github.io/TrackTally/";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";
    const SCOPES = "user-top-read";

    const [token, setToken] = useState("");
    const [user, setUserData] = useState([]);
    const [artistList, setArtists] = useState([]);
    const [trackList, setTracks] = useState([]);
    const [term, setTerm] = useState("short");
    const [amt, setAmt] = useState("10");

    useEffect( () => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if(!token && hash){
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
        setToken(token)
        if(token){
            getUser(token)
            getArtists(token)
            getTracks(token)
        }
    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
        setUserData([])
    }

    const getUser = async (token) => {
        //token.preventDefault()
        const result = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });
        const data = await result.json();
        var pic = profile_pic;
        var username = data.display_name;
        try {
            pic = data.images[0].url;
        } catch (e) {}
        setUserData([username,pic])

    }

    const getArtists = async (toke) => {
        var input = '';
        var artists = [];
        switch(term){
            case "short":
                input = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=' + amt;
                break
            case "medium":
                input = 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=' + amt;
                break
            case "long":
                input = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=' + amt;
                break
            default:
                console.log("error with getArtists: term length parameter is incorrect");
                break
        }
        const result = await fetch(input, {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + toke}
        });
        const data = await result.json();
        for (var i = 0; i < data.items.length; i++) {
            var artist_name = data.items[i].name;
            var pic = profile_pic;
            var artist_link = data.items[i].external_urls.spotify;
            try {
                pic = data.items[i].images[0].url;
            } catch (e) {}

            artists.push({ name: artist_name, pic: pic, link: artist_link});
        }
        setArtists(artists)
    }

    const getTracks = async (toke) => {
        var tracks;
        var input = '';
        switch(term){
            case "short":
                input = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=' + amt;
                break
            case "medium":
                input = 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=' + amt;
                break
            case "long":
                input = 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=' + amt;
                break
            default:
                console.log("error with getTracks: term length parameter is incorrect");
                break
        }
        const result = await fetch(input, {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + toke}
        });
        const data = await result.json();
        tracks = [];
        for (var i = 0; i < data.items.length; i++) {
            var track_name = data.items[i].name;
            var track_artist = data.items[i].album.artists[0].name;
            var track_pic = profile_pic;
            var track_link = data.items[i].external_urls.spotify;
            try {
                track_pic = data.items[i].album.images[0].url;
            } catch (e) {}

            tracks.push({ name: track_name, artist: track_artist, pic: track_pic, link: track_link});
            setTracks(tracks);
        }
    }

    const renderUser = () => {
        if(user.length > 0 && user[1] != null){
            return (
                <div style={styles.preUserContainer}>
                    <div style={styles.welcomeMessage}>Welcome, {user[0]}!</div>
                    <div key={user[0]} style={styles.userContainer}>
                        <img src={user[1]} alt="" style={styles.userImage}/>
                        <span style={styles.userName}>{user[0]}</span>
                    </div>
                </div>
            )
        }

    }
    const renderArtists = () => {
        if (artistList.length > 0 && user.length > 0) {
            return (
                <div style={styles.container}>
                    <h2 style={styles.heading}>Your Top {amt} Artists</h2>
                    <ul style={styles.artistList}>
                        {artistList.map((item, index) => (
                            <li key={index} style={styles.artistItem}>
                                <img
                                    src={item.pic}
                                    alt={`${item.name}'s profile`}
                                    style={styles.artistImage}
                                />
                                <div style={styles.artistInfo}>
                                    <span style={styles.artistName}>{item.name}</span>
                                </div>
                                <a href={item.link} style={styles.artistHref} target={"_blank"} rel={"noopener noreferrer"}><img src={spotify_logo} width={40} height={40} alt={"spotify.com"}/></a>

                            </li>
                        ))}
                    </ul>
                </div>
            )
        } else if (artistList.length < 1 && user.length > 0) {
            return (
            <div style={styles.container}>
                <h2 style={styles.heading}>You don't have any top artists during this period!</h2>
                <h2 style={styles.heading}>Try adjusting the timeframe to see more results.</h2>
            </div>
            )

        }
    };

    const renderTracks = () => {
        if (trackList.length > 0 && user.length > 0) {
            return (
                <div style={styles.container2}>
                    <h2 style={styles.heading2}>Your Top {amt} Tracks</h2>
                    <ul style={styles.trackList}>
                        {trackList.map((item, index) => (
                            <li key={index} style={styles.trackItem}>
                                <img
                                    src={item.pic}
                                    alt={`${item.name}'s profile`}
                                    style={styles.albumImage}
                                />
                                <div style={styles.trackInfo}>
                                    <span style={styles.trackName}>{item.name}</span>
                                    <span style={styles.trackArtistName}>{item.artist}</span>
                                </div>
                                <a href={item.link} style={styles.artistHref} target={"_blank"} rel={"noopener noreferrer"}><img src={spotify_logo} width={40} height={40} alt={"spotify.com"}/></a>
                            </li>
                        ))}
                    </ul>
                </div>
            )
        } else if (trackList.length <= 0 && user.length > 0) {
            return (
                <div style={styles.container2}>
                    <h2 style={styles.heading2}>You don't have any top tracks during this period!</h2>
                    <h2 style={styles.heading2}>Try adjusting the timeframe to see more results.</h2>
                </div>
            )

        }
    };

    const handleTermChange = (event) => {
        setTerm(event.target.value);
    };
    useEffect(() => {
        if(token && user.length > 0){
            getTracks(token);
            getArtists(token);
            renderTracks();
            renderArtists();
        }
    }, [term]);
    const termDropdown = () => {
        if(token && user.length > 0){
            return (
                <div style={styles.dropdownContainer}>
                    <label htmlFor="timeframe" style={styles.dropdownLabel}>
                        Select Timeframe:
                    </label>
                    <select id="timeframe" value={term} onChange={handleTermChange} style={styles.dropdown}>
                        <option value="short">1 Month</option>
                        <option value="medium">6 Months</option>
                        <option value="long">1 Year</option>
                    </select>
                </div>
            );
        }

    };
    const handleAmtChange = (event) => {
        setAmt(event.target.value);
    };
    useEffect(() => {
        if(token && user.length > 0){
            getTracks(token);
            getArtists(token);
            renderTracks();
            renderArtists();
        }
    }, [amt]);
    const amtDropdown = () => {
        if(token && user.length > 0){
            return (
                <div style={styles.dropdownContainer}>
                    <label htmlFor="amount" style={styles.dropdownLabel}>
                        Select Quantity:
                    </label>
                    <select id="timeframe" value={amt} onChange={handleAmtChange} style={styles.dropdown}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            );
        }

    };

    const styles = {
        appContainer: {
            fontFamily: 'Arial, sans-serif',
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: '0',
            left: '0',
            background: '#f0f0f0',
            overflowY: 'scroll',
            boxSizing: 'border-box',
        },
        header: {
            textAlign: 'center',
            color: '#333',
            padding: '10px',
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            zIndex: '1000',
            background: '#fff',
            borderBottom: '1px solid #ddd',
        },
        loginLink: {
            textDecoration: 'none',
            color: '#007bff',
            padding: '8px 16px',
            background: '#fff0f0',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
        },
        logoutButton: {
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        },
        content: {
            marginTop: '10%', // Adjust based on header height
            padding: '20px',
        },
        //user stuff below
        preUserContainer: {
            textAlign: 'center',
            padding: '10px',
        },
        welcomeMessage: {
            fontSize: '1.5em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
        },
        userContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            borderRadius: '1000px',
            backgroundColor: '#fff',
            maxWidth: '200px', // Set your desired max width
            margin: '0 auto',
        },
        userImage: {
            marginRight: '12px',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            objectFit: 'cover',
        },
        userName: {
            fontSize: '1.2em',
            color: '#333',
        },
        //artistlist below
        container: {
            fontFamily: 'Arial, sans-serif',
            width: '350px',
            margin: 'auto',
            padding: '30px',
            position: 'fixed',
            left: '0',
            top: '15%',
            bottom: '0',
            overflow: 'scroll',
            background: '#f0f0f0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
        heading: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '30px',
            fontSize: '1.5em',
        },
        artistList: {
            listStyle: 'none',
            padding: '0',
        },
        artistItem: {
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '1200px',
            overflow: 'scroll',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            maxWidth: '350px',
        },
        artistImage: {
            width: '60px',
            height: '60px',
            borderRadius: '100%',
            objectFit: 'cover',
            marginRight: '5px',
        },
        artistInfo: {
            marginLeft: '10px',
            marginRight: '10px'
        },
        artistName: {
            fontSize: '1.2em',
            color: '#232323',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '5px',
        },
        artistHref:{
            marginLeft: 'auto',
            display: 'inline-block',
            marginRight: '10px'
        },
        //item list below
        container2: {
            fontFamily: 'Arial, sans-serif',
            width: '350px',
            margin: 'auto',
            padding: '30px',
            position: 'fixed',
            right: '0',
            top: '15%',
            bottom: '0',
            overflow: 'scroll',
            background: '#f0f0f0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
        heading2: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '30px',
            fontSize: '1.5em',
        },
        trackList: {
            listStyle: 'none',
            padding: '0',
        },
        trackItem: {
            marginBottom: '10.0px',
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '1200px',
            overflow: 'scroll',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            maxWidth: '350px',
        },
        albumImage: {
            width: '60px',
            height: '60px',
            borderRadius: '100%',
            objectFit: 'cover',
            marginRight: '5px',
        },
        trackInfo: {
            marginLeft: '10px',
            marginRight: '10px'
        },
        trackName: {
            fontSize: '1.2em',
            color: '#232323',
            fontWeight: 'bold',
            display: 'inline-block',
            marginTop: '6px',
            marginBottom: '0px',
        },
        trackArtistName: {
            fontSize: '0.8em',
            color: '#626262',
            fontWeight: 'bold',
            display: 'block',
        },
        //term dropdown below
        dropdownContainer: {
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '20px auto',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#fff',
            maxWidth: '200px',
            width: '100%',
        },
        dropdownLabel: {
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1.2em',
            marginBottom: '10px',
            display: 'block',
            color: '#333',
        },
        dropdown: {
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '10px',
            fontSize: '1em',
            width: '100%',
            borderRadius: '4px',
            border: '2px solid #ccc',
            backgroundColor: '#f8f8f8',
            appearance: 'none',
        },
        //login stuff below
        fancyHeader: {
            textAlign: 'center',
            backgroundColor: '#3498db',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        fancyHeaderText: {
            fontSize: '24px',
            margin: '0',
        },

    };


    return (
        <div style={styles.appContainer}>
            <header style={styles.header}>
                <h1>TrackTally</h1>
                {!token ? (
                    <a
                        href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}
                        style={styles.loginLink}
                    >
                        Login to Spotify
                    </a>
                ) : (
                    <button onClick={logout} style={styles.logoutButton}>
                        Logout
                    </button>
                )}
            </header>
            <div style={styles.content}>
                {renderUser()}
                {renderArtists()}
                {renderTracks()}
                {termDropdown()}
                {amtDropdown()}
            </div>
            {!token ? (
                <div>
                    <header style={styles.fancyHeader}>
                        <h1 style={styles.fancyHeaderText}>Log in to find your favorite artists and songs!</h1>
                    </header>
                </div>
            ) : (console.log("yo"))
            }


        </div>
    );


}

export default App;
