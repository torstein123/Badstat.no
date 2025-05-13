import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, 
    faUser, 
    faTag, 
    faArrowLeft,
    faShare,
    faChevronRight,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const navigate = useNavigate();
    
    // Sample blog posts data (in a real app, this would come from an API/database)
    const blogPosts = [
        {
            id: 1,
            title: 'Din første badmintonturnering: Hva du bør vite',
            excerpt: 'Nyttige tips og råd for deg som skal delta i din første badmintonturnering - fra påmelding til oppvarming og kampforberedelser.',
            content: `
                <p class="text-gray-300">Å delta i din første badmintonturnering kan være både spennende og litt skremmende. Jeg husker fortsatt min første turnering - nervene, forventningene og alle spørsmålene jeg hadde. Etter å ha spilt i og organisert flere turneringer gjennom årene, ønsker jeg å dele noen tips som kan gjøre din første turneringsopplevelse bedre.</p>
                
                <h2 class="text-white">Før turneringen - forberedelser</h2>
                <p class="text-gray-300">Det er mye som skjer når du kommer til hallen på turneringsdagen. For å unngå ekstra stress, er det lurt å forberede seg godt.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Påmelding og klasseinndeling</h3>
                <p class="text-gray-300">De fleste turneringer i Norge bruker badmintonportalen.no for påmelding. Som nybegynner vil du trolig spille i klasse D eller U (ungdom hvis du er junior). Er du usikker, spør treneren din eller kontakt arrangørklubben. Det er bedre å starte i en lavere klasse og vinne kamper, enn å møte for tøff motstand med en gang.</p>
                
                <p class="text-gray-300">Påmeldingsfristen er som regel 2-3 uker før turneringen. Merk at du må ha lisens for å delta i offisielle turneringer - dette kan kjøpes gjennom klubben din eller via badmintonforbundets nettsider.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Pakkeliste</h3>
                <p class="text-gray-300">Her er hva du bør ha med deg:</p>
                
                <ul class="text-gray-300 ml-6 list-disc">
                    <li>Minst to racketer (snoren kan ryke)</li>
                    <li>Innesko med lyse såler</li>
                    <li>Flere t-skjorter/shorts (du kommer til å svette)</li>
                    <li>Håndkle</li>
                    <li>Vannflaske</li>
                    <li>Energirik mat og snacks (banan, nøtter, energibarer)</li>
                    <li>Gnagsårplaster (nye sko kan gi blemmer)</li>
                    <li>Hårstrikk for langhårede</li>
                </ul>
                
                <p class="text-gray-300">Et lite førstehjelpsskrin med sportstape og plaster kan også være nyttig. Jo flere turneringer jeg har spilt, jo mer har jeg innsett verdien av god forberedelse.</p>
                
                <h2 class="text-white">Turneringsdagen</h2>
                <p class="text-gray-300">Møt opp i god tid - minst 45 minutter før din første kamp er satt opp. Dette gir deg tid til å registrere deg, finne garderoben, og gjøre deg kjent med hallen.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Oppvarming</h3>
                <p class="text-gray-300">En skikkelig oppvarming er ekstra viktig i turneringer. Kroppen presterer bedre og risikoen for skader reduseres. Begynn med 10-15 minutter generell oppvarming - jogging, hoppetau eller lignende til du kjenner at du er varm og svetter lett.</p>
                
                <p class="text-gray-300">Deretter bør du varme opp spesifikt med racket og ball i 10-15 minutter hvis det er ledige baner. Fokuser på grunnslag og bevegelsesmønstre. Jeg pleier alltid å inkludere noen smasher og klipp for å få skulderen ordentlig varm.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Kampavvikling</h3>
                <p class="text-gray-300">Følg med på kampoppropet. I de fleste turneringer ropes kampene opp på høyttaler, men det kan også være digitale tavler eller oppslag på veggen. Når kampen din blir ropt opp, må du møte på banen umiddelbart.</p>
                
                <p class="text-gray-300">Husk at i badminton dømmer vi ofte selv på lavere nivåer. Tell høyt og tydelig, og ved uenighet - ta ballen om igjen. Ved større konflikter kan du tilkalle hoveddommer.</p>
                
                <h2 class="text-white">Under kampen</h2>
                <p class="text-gray-300">Noen konkrete råd for selve kampen:</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Mental innstilling</h3>
                <p class="text-gray-300">Forvent ikke å vinne første gang. Se på turneringen som en læringsmulighet. Jeg tapte alle mine kamper i min første turnering, men lærte utrolig mye som jeg kunne ta med meg videre.</p>
                
                <p class="text-gray-300">Fokuser på å spille ditt eget spill og prøv å holde nervene i sjakk. Alle er nervøse i sin første turnering - selv erfarne spillere kjenner på sommerfugler i magen.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Taktiske tips</h3>
                <p class="text-gray-300">Start kampen med sikre slag. Det er bedre å komme i gang med noen sikre klareringer enn å bomme på avanserte slag tidlig. Mange nybegynnere gjør feilen at de prøver for vanskelige slag for tidlig i kampen.</p>
                
                <p class="text-gray-300">Ta pauser mellom poengene, spesielt når du er sliten. Du har lov til å tørke svette, drikke vann og samle tankene. Bruk dette bevisst, men ikke overdriv - det kan virke usportslig.</p>
                
                <h3 class="text-white text-lg mt-4 mb-2">Restitusjon mellom kamper</h3>
                <p class="text-gray-300">Hvis du har flere kamper samme dag, er restitusjon avgjørende. Drikk vann, spis noe lett, og hold kroppen varm mellom kampene. En kort tur ut for frisk luft kan også gjøre underverker for konsentrasjonen.</p>
                
                <h2 class="text-white">Etter turneringen</h2>
                <p class="text-gray-300">Ta deg tid til en skikkelig nedjogging og tøyning etter siste kamp. Dette reduserer stølhet og gjør at du føler deg bedre dagen etter.</p>
                
                <p class="text-gray-300">Reflekter over kampene dine, gjerne ved å notere hva som gikk bra og hva du kan forbedre. Diskuter gjerne med treneren din eller mer erfarne spillere. Jeg har ofte lært mer av en tapt kamp enn av mange vunne kamper.</p>
                
                <h2 class="text-white">Turneringsånd</h2>
                <p class="text-gray-300">Husk at badminton er en sport med stolte tradisjoner for fair play og respekt. Takk alltid motstanderen for kampen, uansett resultat. Hvis du vinner, ikke overdriv feiringen. Hvis du taper, gratuler vinneren med et smil.</p>
                
                <p class="text-gray-300">Bruk også turneringer som en mulighet til å bli kjent med andre spillere og utvide badmintonmiljøet ditt. Noen av mine beste badmintonvenner møtte jeg først som motstandere i turneringer.</p>
                
                <h2 class="text-white">Avslutning</h2>
                <p class="text-gray-300">Din første turnering markerer starten på en spennende reise i badmintonverdenen. Husk at alle har vært nybegynnere en gang, og at målet først og fremst er å ha det gøy og lære.</p>
                
                <p class="text-gray-300">Lykke til i din første turnering! Kanskje ses vi over nettet en dag?</p>
            `,
            author: 'Torstein Vikse Olsen',
            date: '2025-04-20',
            image: 'https://images.unsplash.com/photo-1599391398131-cd12dfc6c24e?q=80&w=2622&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            category: 'trening'
        }
    ];
    
    const categories = [
        { id: 'all', name: 'Alle kategorier' },
        { id: 'turneringer', name: 'Turneringer' },
        { id: 'trening', name: 'Trening og teknikk' },
        { id: 'profiler', name: 'Spillerprofiler' },
        { id: 'statistikk', name: 'Statistikk og analyse' },
        { id: 'ungdom', name: 'Barne- og ungdomsbadminton' }
    ];
    
    useEffect(() => {
        // Simulate API fetch with a timeout
        const timer = setTimeout(() => {
            const foundPost = blogPosts.find(p => p.id.toString() === id);
            
            if (foundPost) {
                setPost(foundPost);
                
                // Find related posts (same category)
                const related = blogPosts
                    .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
                    .slice(0, 3);
                setRelatedPosts(related);
            } else {
                // Redirect to blog list if post not found
                navigate('/blogg');
            }
            
            setLoading(false);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [id, navigate]);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    
    if (!post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-16">
                <div className="max-w-3xl mx-auto py-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Innlegg ikke funnet</h1>
                    <p className="text-gray-300 mb-6">Blogginnlegget du leter etter finnes ikke.</p>
                    <Link 
                        to="/blogg"
                        className="inline-flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Tilbake til blogg
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-4xl mx-auto py-12">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-gray-400">
                        <Link to="/" className="hover:text-indigo-300 transition-colors duration-300">Hjem</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="mx-2 text-xs" />
                        <Link to="/blogg" className="hover:text-indigo-300 transition-colors duration-300">Blogg</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="mx-2 text-xs" />
                        <span className="text-indigo-300">{post.title}</span>
                    </div>
                </div>
                
                {/* Article header */}
                <div className="mb-8">
                    <Link 
                        to="/blogg"
                        className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors duration-300 mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Tilbake til blogg
                    </Link>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-400 mb-6 space-x-6">
                        <span className="flex items-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-400" />
                            {post.date}
                        </span>
                        <span className="flex items-center">
                            <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-400" />
                            {post.author}
                        </span>
                        <span className="flex items-center">
                            <FontAwesomeIcon icon={faTag} className="mr-2 text-indigo-400" />
                            {categories.find(c => c.id === post.category)?.name || post.category}
                        </span>
                    </div>
                </div>
                
                {/* Featured image */}
                <div className="mb-8 rounded-xl overflow-hidden max-w-2xl mx-auto">
                    <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
                
                {/* Article content */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 mb-8">
                    <div 
                        className="prose prose-invert prose-indigo max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                        style={{
                            '--tw-prose-body': 'rgba(229, 231, 235, 0.9)',
                            '--tw-prose-headings': 'rgba(255, 255, 255, 0.9)',
                            '--tw-prose-lead': 'rgba(209, 213, 219, 0.9)',
                            '--tw-prose-links': 'rgba(165, 180, 252, 1)',
                            '--tw-prose-bold': 'rgba(255, 255, 255, 0.9)',
                            '--tw-prose-counters': 'rgba(209, 213, 219, 0.9)',
                            '--tw-prose-bullets': 'rgba(209, 213, 219, 0.9)',
                            '--tw-prose-hr': 'rgba(107, 114, 128, 0.4)',
                            '--tw-prose-quotes': 'rgba(209, 213, 219, 0.9)',
                            '--tw-prose-quote-borders': 'rgba(107, 114, 128, 0.4)',
                            '--tw-prose-captions': 'rgba(107, 114, 128, 0.9)',
                            '--tw-prose-code': 'rgba(255, 255, 255, 0.9)',
                            '--tw-prose-pre-code': 'rgba(229, 231, 235, 0.9)',
                            '--tw-prose-pre-bg': 'rgba(0, 0, 0, 0.3)',
                            '--tw-prose-th-borders': 'rgba(107, 114, 128, 0.4)',
                            '--tw-prose-td-borders': 'rgba(107, 114, 128, 0.4)'
                        }}
                    ></div>
                </div>
                
                {/* Share buttons */}
                <div className="mb-12">
                    <div className="flex items-center space-x-4">
                        <span className="text-white">Del denne artikkel:</span>
                        <button className="bg-blue-600 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300">
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                        {/* Additional share buttons would go here */}
                    </div>
                </div>
                
                {/* Related posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Relaterte artikler</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map(relatedPost => (
                                <div 
                                    key={relatedPost.id} 
                                    className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group"
                                >
                                    <div className="h-40 overflow-hidden">
                                        <img 
                                            src={relatedPost.image} 
                                            alt={relatedPost.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">
                                            {relatedPost.title}
                                        </h3>
                                        <Link 
                                            to={`/blogg/${relatedPost.id}`}
                                            className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors duration-300 text-sm"
                                        >
                                            Les mer
                                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPost; 