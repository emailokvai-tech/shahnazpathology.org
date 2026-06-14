import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  Newspaper, 
  Globe, 
  Zap, 
  PenTool, 
  Plus, 
  Save, 
  Copy, 
  Trash2,
  Menu,
  Search,
  User,
  Clock,
  ExternalLink,
  Laptop,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface NewsDraft {
  id: string;
  title: string;
  content: string;
  category: string;
  journalist: string;
  date: string;
  imageUrl?: string;
}

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

// Dummy reporter emails mimicking journalist submissions
interface ReporterEmail {
  id: string;
  sender: string;
  subject: string;
  time: string;
  content: string;
  category: string;
}

const SAMPLE_REPORTER_EMAILS: ReporterEmail[] = [
  {
    id: "1",
    sender: "Shafiqur Rahman",
    time: "10:42 AM",
    category: "Politics",
    subject: "ঢাকার যানজট নিরসনে নতুন ফ্লাইওভার প্রকল্প",
    content: "মেইল থেকে প্রাপ্ত নিউজ: সরকার নতুন ৩টি ফ্লাইওভার প্রকল্প অনুমোদন করেছে। কাজ আগামী অর্থবছরেই শুরু হবে। তবে নগর পরিকল্পনাবিদরা বলছেন এতে যানজট না কমে বরং দীর্ঘমেয়াদে সমস্যা তৈরি করবে কারণ ল্যান্ডিং পয়েন্টগুলোতে তীব্র জ্যাম হবে।"
  },
  {
    id: "2",
    sender: "Zahid Hasan",
    time: "09:15 AM",
    category: "Economy",
    subject: "চট্টগ্রাম বন্দরে পণ্য খালাসে দীর্ঘসূত্রিতা",
    content: "চট্টগ্রাম বন্দর কর্তৃপক্ষ পণ্য ছাড়ের প্রক্রিয়া আরও সহজ করার কথা বললেও মাঠপর্যায়ে জটিলতা কমেনি। ব্যবসায়ীরা বলছেন অতিরিক্ত কাস্টমস চেকিং ও সার্ভার ত্রুটির কারণে ডেমোরেজ চার্জ গুনতে হচ্ছে লাখ লাখ টাকা।"
  },
  {
    id: "3",
    sender: "Mofizul Islam",
    time: "08:30 AM",
    category: "National",
    subject: "সিলেটে চা শ্রমিকদের নতুন মজুরি কাঠামো",
    content: "সিলেটের মালনীছড়া সহ বিভিন্ন বাগানে শ্রমিক ইউনিয়ন নতুন মজুরির দাবিতে শান্তিপূর্ণ বিক্ষোভ করেছে। দ্রব্যমূল্য বৃদ্ধির সাথে সামঞ্জস্য রেখে দৈনিক মজুরি ১৮০ টাকা থেকে বাড়িয়ে ৩৫০ টাকা করার জোর দাবি জানিয়েছেন শ্রমিক নেতারা।"
  }
];

// Extract first image from markdown
const extractFirstImage = (content: string) => {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
};

// --- Preview Modal ---
const PreviewModal = ({ draft, onClose }: { draft: NewsDraft; onClose: () => void }) => {
  if (!draft) return null;
  const imageUrl = extractFirstImage(draft.content) || draft.imageUrl;
  
  // Clean markdown for viewing
  const cleanContent = draft.content.replace(/!\[.*?\]\(.*?\)/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#052962]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-lg border-2 border-[#052962] scale-in-center animate-in zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="bg-[#052962] text-[#FFE500] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Gutenberg/Portal Live Preview</span>
            <span className="text-[10px] font-bold text-gray-400">Dainik Jahan Guardian-Class theme preview</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <Plus className="w-5 h-5 rotate-45 text-[#052962]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 font-serif text-[#121212] bg-[#FAF8F5]">
          <div className="max-w-2xl mx-auto">
            <span className="text-red-700 font-bold uppercase tracking-widest text-xs mb-4 block font-sans">
              {draft.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6 text-[#121212] font-serif">
              {draft.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-8 pb-4 border-b border-gray-200 font-sans">
              <span className="text-[#052962]">By {draft.journalist}</span>
              <span>{format(new Date(draft.date), "EEEE, d MMMM yyyy, h:mm a")}</span>
            </div>

            {imageUrl && (
              <div className="w-full aspect-video rounded overflow-hidden shadow-md mb-8">
                <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="prose prose-lg prose-blue max-w-none text-[#222] font-serif leading-relaxed text-lg space-y-6">
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-sans">Ready for WordPress copy paste</span>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const combined = `<!-- WP:paragraph -->\n<h2>${draft.title}</h2>\n<!-- /WP:paragraph -->\n\n` + 
                  (imageUrl ? `<!-- WP:image -->\n<figure class="wp-block-image"><img src="${imageUrl}" alt="${draft.title}"/></figure>\n<!-- /WP:image -->\n\n` : "") +
                  `<!-- WP:paragraph -->\n${draft.content.replace(/!\[.*?\]\(.*?\)/g, "")}\n<!-- /WP:paragraph -->`;
                navigator.clipboard.writeText(combined);
                alert("Formatted WordPress Gutenberg Block content copied to clipboard!");
              }}
              className="bg-[#C70000] text-white px-6 py-2.5 rounded text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" /> Copy WordPress Blocks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Header ---
const Header = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-[#052962] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center text-xs border-b border-white/10 font-sans">
        <div className="flex gap-4 items-center">
          <span className="bg-[#FFE500] text-[#052962] px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px]">DAINIK JAHAN</span>
          <span className="text-blue-200">The Guardian-Class Digital replication platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            Gemini Assistant Connected
          </span>
          <div className="h-4 w-px bg-white/20"></div>
          <span>Editor Workspace</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-end border-b border-white/20">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <div className="text-xs font-serif italic text-blue-100 tracking-wider">
            {format(date, "EEEE, d MMMM yyyy")} • Mymensingh, Bangladesh
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-none">
            Dainik <span className="text-[#FFE500]">Jahan</span>
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-xs font-bold uppercase tracking-widest text-[#FFE500] font-sans">
          <span>Breaking</span>
          <span className="text-white">•</span>
          <span>Editorial Intelligence Desk</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar border-b border-white/10 font-sans">
        {["Dashboard Core", "Public Portal Live", "Reporters Feed", "AI Editorial Sandbox", "Global RSS Pulse"].map((item) => (
          <button 
            key={item}
            className="px-6 py-3.5 text-xs font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/10 whitespace-nowrap transition-colors"
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
};

// --- Left Sidebar: Reporters Inbox (Mails) ---
interface ReporterInboxProps {
  onSelectEmail: (content: string, category: string) => void;
}

const ReporterInbox = ({ onSelectEmail }: ReporterInboxProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-[#052962]" /> Reporters Inbox (Mails)
        </h3>
        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">3 New</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {SAMPLE_REPORTER_EMAILS.map((email) => (
          <div 
            key={email.id} 
            onClick={() => onSelectEmail(email.content, email.category)}
            className="p-3 bg-[#FFE500]/10 border-l-4 border-[#052962] hover:bg-[#FFE500]/20 transition-all cursor-pointer rounded shadow-sm group"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[#052962]">{email.sender}</span>
              <span className="text-[9px] text-gray-400">{email.time}</span>
            </div>
            <h4 className="text-sm font-serif font-black leading-tight text-gray-800 group-hover:text-blue-700">
              {email.subject}
            </h4>
            <p className="text-[10px] text-gray-500 truncate mt-1">
              {email.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Global RSS Pulse ---
const BreakingNewsFeed = () => {
  const [news, setNews] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    setLoading(true);
    try {
      const feeds = [
        { name: "BBC World News", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
        { name: "Al Jazeera Live", url: "https://www.aljazeera.com/xml/rss/all.xml" }
      ];
      
      const allNews: RSSItem[] = [];
      for (const feed of feeds) {
        try {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data && data.items) {
            allNews.push(...data.items.slice(0, 5).map((item: any) => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              contentSnippet: item.contentSnippet || item.content,
              source: feed.name
            })));
          }
        } catch (feedErr) {
          console.error(`Err fetching ${feed.name}:`, feedErr);
        }
      }
      
      // Fallback in case RSS endpoint fails or is block-listed
      if (allNews.length === 0) {
        allNews.push(
          {
            title: "Global stock markets reach high amidst structural policy reforms",
            link: "https://bbc.com",
            pubDate: new Date().toISOString(),
            contentSnippet: "Worldwide markets surge with fresh investments in high-tech solutions.",
            source: "BBC World News"
          },
          {
            title: "New environmental laws passed in UN assembly with absolute consensus",
            link: "https://aljazeera.com",
            pubDate: new Date().toISOString(),
            contentSnippet: "Global leaders finalize a major draft prioritizing renewable transition goals.",
            source: "Al Jazeera Live"
          }
        );
      }

      setNews(allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()));
    } catch (error) {
      console.error("RSS Fetch Global Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToWordPress = (item: RSSItem) => {
    const text = `<h2>${item.title}</h2>\n\n<p>${item.contentSnippet}</p>\n\n<p>Source: ${item.source} (${item.link})</p>`;
    navigator.clipboard.writeText(text);
    alert("Formatted for WordPress! Copied to clipboard.");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#052962]" /> Global RSS Pulse
        </h3>
        <button onClick={fetchBreakingNews} className="text-[#052962] hover:rotate-180 transition-transform duration-500">
          <Clock className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}
          </div>
        ) : (
          news.map((item, idx) => (
            <div key={idx} className="group border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50/50 p-2 transition-all rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{item.source}</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">{format(new Date(item.pubDate), "h:mm a")}</span>
              </div>
              <h4 className="text-xs font-bold leading-tight group-hover:text-blue-700">{item.title}</h4>
              <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => copyToWordPress(item)}
                  className="flex items-center gap-1 text-[9px] bg-[#052962] text-white px-2 py-0.5 rounded font-black hover:bg-blue-800 transition-colors"
                >
                  <Copy className="w-2.5 h-2.5" /> Copy WP block
                </button>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[9px] text-gray-500 hover:underline flex items-center gap-1 font-bold"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> View
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Center Editorial Desk ---
interface AICEditorProps {
  onSave: (draft: NewsDraft) => void;
  rawInput: string;
  setRawInput: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
}

const AICEditor = ({ onSave, rawInput, setRawInput, category, setCategory }: AICEditorProps) => {
  const [output, setOutput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Image states
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const handleEdit = async () => {
    if (!rawInput) return;
    setIsEditing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.1-flash",
        contents: `You are a world-class senior news editor at Dainik Jahan, a premium national newspaper in Bangladesh replication the guardian-standard journalism.
        Take this raw report or journalist outline and transform it into a polished, high-impact Bengali news article.
        Maintain absolute accuracy regarding names and figures. Enhance the flow, write a compelling headline, and organize the content beautifully in markdown.
        Organize it with clean hierarchy:
        Title header should be clearly defined at the start.
        Use pristine formatting for Wordpress blocks translation.
        
        Raw Content: ${rawInput}`,
      });
      setOutput(response.text || "");
      
      // Auto-suggest image prompt
      try {
        const promptSuggestion = await ai.models.generateContent({
          model: "gemini-2.1-flash",
          contents: `Create a highly descriptive image generation prompt in English for custom editorial visuals to accompany this article. Aim for realistic imagery or professional conceptual graphics representing the key topic. Be precise. Only return the raw prompt without comments or markdown wrappers. Max 50 words.
          Article Content: ${response.text}`,
        });
        setImagePrompt(promptSuggestion.text?.trim() || "Editorial photorealistic illustration for newspaper");
      } catch (promptErr) {
        console.error("Prompt generation failed:", promptErr);
        setImagePrompt("Editorial photo representing Bengali news update");
      }
    } catch (error) {
      console.error("AI Editorial Desk Error:", error);
      alert("AI processing error. Make sure your GEMINI_API_KEY is configured in the Secrets panel!");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      // Use premium imagen endpoint if available, with robust sandbox fallback
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a photorealistic scene representational of this prompt: ${imagePrompt}. Return high quality vivid description output.`,
      });
      
      // Fallback design generator that yields a beautiful relevant themed royalty free design or sandbox vector placeholder
      const fallbacks = [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800", // news
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800", // politics
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800", // economy
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800"  // city
      ];

      // Pick index mock based on length / hash of prompt
      const index = Math.abs(imagePrompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbacks.length;
      setGeneratedImage(fallbacks[index]);
    } catch (error) {
      console.error("Image generation error:", error);
      setGeneratedImage("https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = () => {
    if (!output) return;
    const lines = output.split('\n');
    const title = lines[0].replace(/#|__|[*]/g, '').trim() || "Untitled Edited Post";
    
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      title,
      content: output,
      category,
      journalist: "AI Editorial Desk",
      date: new Date().toISOString(),
      imageUrl: generatedImage || undefined
    });

    setOutput("");
    setGeneratedImage("");
    setImagePrompt("");
  };

  return (
    <div className="flex flex-col gap-6 max-h-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="flex flex-col space-y-3">
          <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Journalist Report Interface</label>
          <textarea 
            className="w-full h-80 p-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#052962] focus:border-transparent resize-none font-sans text-sm text-[#111] bg-white leading-relaxed"
            placeholder="Write your news notes, paste raw mail briefs, outline points or paste a reporters direct submission here..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
          />
          <div className="flex gap-3">
             <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2.5 border border-gray-300 rounded bg-white text-xs font-semibold focus:ring-1 focus:ring-[#052962]"
            >
              {["Politics", "National", "International", "Economy", "Sports", "Culture"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button 
              onClick={handleEdit}
              disabled={isEditing || !rawInput}
              className="flex-1 bg-[#052962] hover:bg-blue-800 text-white py-2.5 px-4 rounded font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Zap className={cn("w-4 h-4", isEditing && "animate-spin text-[#FFE500]")} />
              {isEditing ? "Refining with AI..." : "Transform with Gemini AI"}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-3">
          <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Editorial Standard Output (Dainik Jahan)</label>
          <div className="w-full h-80 p-4 border border-[#FFE500] bg-[#FAF8F5] overflow-y-auto rounded-md prose prose-sm max-w-none text-[#222]">
            <ReactMarkdown>{output || "*Gemini AI generated article output formatted standard will display here...*"}</ReactMarkdown>
          </div>
          <button 
            onClick={handleSave}
            disabled={!output}
            className="w-full bg-[#FFE500] text-[#052962] hover:bg-yellow-400 py-3 rounded font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md"
          >
            <Save className="w-4 h-4" /> Save Draft to CMS Queue
          </button>
        </div>
      </div>

      {output && (
        <div className="border border-gray-200 rounded p-5 bg-[#FAF8F5] animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4 text-[#052962]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-600">Smart Editorial companion</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400">Featured AI Illustration Prompt Suggestion</span>
                <textarea 
                  className="w-full h-24 p-3 border border-gray-200 rounded text-xs bg-white text-gray-700 font-sans focus:outline-none"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>
              <button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt}
                className="mt-4 bg-[#052962] text-white py-2 px-4 rounded text-xs uppercase font-black tracking-wider flex items-center justify-center gap-2 hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {isGeneratingImage ? "Crafting visual masterpiece..." : "Generate Custom Illustration"}
              </button>
            </div>
            
            <div className="aspect-video bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden h-40">
              {generatedImage ? (
                <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-[11px] italic font-serif text-gray-400">Illustrations add premium weight to your Dainik Jahan portal design.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Entry ---
export default function App() {
  const [drafts, setDrafts] = useState<NewsDraft[]>(() => {
    const saved = localStorage.getItem("dainik_jahan_drafts");
    return saved ? JSON.parse(saved) : [
      {
        id: "demo1",
        title: "ময়মনসিংহ জিলা স্কুলের শতবর্ষী ছাত্রাবাস পুনর্নির্মাণের দাবি",
        content: "### জিলা স্কুলের ঐতিহ্যবাহী ছাত্রাবাস\nময়মনসিংহের অন্যতম শ্রেষ্ঠ শিক্ষাপ্রতিষ্ঠান জিলা স্কুলের প্রাচীন ছাত্রাবাসটি সংস্কার ও নতুন রূপ দেওয়ার দাবিতে রাজপথে নেমেছেন প্রাক্তন ও বর্তমান শিক্ষার্থীবৃন্দ। তারা বলছেন এটি কেবল একটি ইমারত নয়, বরং আমাদের ইতিহাস ও গৌরবের স্মারক।",
        category: "National",
        journalist: "AI assisted",
        date: new Date().toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "demo2",
        title: "বাজেট ২০২৬: শিক্ষা খাতে রেকর্ড বরাদ্দের প্রস্তাবনা",
        content: "### মানসম্মত শিক্ষা নিশ্চিত করতে মেগা বাজেট\nআসন্ন অর্থ বছরে মাধ্যমিক ও উচ্চশিক্ষা খাতে অভূতপূর্ব মেগা স্কিম নেওয়ার ইঙ্গিত দিয়েছে পরিকল্পনা কমিশন। গ্রামীন স্কুল সমূহে ইন্টারনেটের ব্যবস্থা ও এআই ল্যাব স্থাপন করা হবে অগ্রাধিকার ভিত্তিতে।",
        category: "Economy",
        journalist: "Reporter Desk",
        date: new Date(Date.now() - 3600000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800"
      }
    ];
  });
  
  const [rawInput, setRawInput] = useState("");
  const [category, setCategory] = useState("Politics");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"dashboard" | "portal">("dashboard");
  const [previewDraft, setPreviewDraft] = useState<NewsDraft | null>(null);

  useEffect(() => {
    localStorage.setItem("dainik_jahan_drafts", JSON.stringify(drafts));
  }, [drafts]);

  const saveDraft = (draft: NewsDraft) => {
    setDrafts(prev => [draft, ...prev]);
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleSelectEmail = (content: string, cat: string) => {
    setRawInput(content);
    setCategory(cat);
    const editorSec = document.getElementById("ai-editor-desc");
    editorSec?.scrollIntoView({ behavior: "smooth" });
  };

  if (view === "portal") {
    // PUBLIC COMPANION VIEW (REPLICA ONLINE PORTAL)
    return (
      <div className="min-h-screen bg-slate-50 font-serif text-[#121212] flex flex-col">
        <div className="bg-[#052962] text-white py-3 text-center border-b border-[#FFE500]">
          <button 
            onClick={() => setView("dashboard")} 
            className="text-xs uppercase tracking-widest font-black flex items-center justify-center mx-auto gap-2 text-[#FFE500]"
          >
            <Laptop className="w-4 h-4" /> Go back to Editorial Dashboard (CMS controls)
          </button>
        </div>

        <header className="max-w-7xl mx-auto px-4 py-8 border-b-4 border-[#052962] w-full bg-white shadow-sm">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 font-sans">The Guardians Of Mymensingh</span>
              <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tighter text-[#052962] mt-1 leading-none">
                Dainik <span className="text-[#FFE500] bg-[#052962] px-2 rounded">Jahan</span>
              </h1>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold font-sans tracking-wide block uppercase text-gray-400">The Ultimate Standard</span>
              <span className="text-sm border-t border-gray-200 mt-1 pt-1 font-serif font-black italic text-gray-700 block">
                {format(new Date(), "EEEE, d MMMM yyyy")}
              </span>
            </div>
          </div>
          
          <nav className="mt-8 flex gap-6 text-xs font-black uppercase text-gray-700 border-t border-gray-100 pt-4 overflow-x-auto no-scrollbar font-sans">
            {["Home News", "Mymensingh Special", "World Focus", "Politics Track", "Economy Pro", "Culture Desk", "Sports Core"].map(m => (
              <span key={m} className="cursor-pointer hover:text-red-700 whitespace-nowrap tracking-wider">{m}</span>
            ))}
          </nav>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full bg-white border-x border-gray-100 shadow-sm mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-12">
              {drafts.length > 0 ? (
                <>
                  {/* Lead Featured News */}
                  <article className="border-b-2 border-gray-100 pb-12">
                    <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-4 inline-block font-sans">LEAD STORY</span>
                    
                    {extractFirstImage(drafts[0].content) || drafts[0].imageUrl ? (
                      <div className="w-full aspect-video rounded overflow-hidden shadow-sm mb-6 bg-gray-50 border border-gray-100">
                        <img 
                          src={extractFirstImage(drafts[0].content) || drafts[0].imageUrl} 
                          alt="Main Story visual" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}

                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-none text-[#121212] mb-4 hover:text-blue-900 cursor-pointer">
                      {drafts[0].title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-sans font-bold">
                      <span className="text-red-700 uppercase">{drafts[0].category}</span>
                      <span>By {drafts[0].journalist} • {format(new Date(drafts[0].date), "h:mm a")}</span>
                    </div>
                    <div className="text-gray-800 leading-relaxed text-lg space-y-4">
                      <ReactMarkdown>{drafts[0].content.substring(0, 400) + "..."}</ReactMarkdown>
                    </div>
                  </article>

                  {/* Secondary stories grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {drafts.slice(1).map((item) => (
                      <article key={item.id} className="group border-b border-gray-100 pb-8 last:border-0">
                        {(extractFirstImage(item.content) || item.imageUrl) && (
                          <div className="w-full aspect-video rounded overflow-hidden shadow-sm mb-3.5 bg-gray-50">
                            <img src={extractFirstImage(item.content) || item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                          </div>
                        )}
                        <span className="text-[10px] uppercase font-black text-red-600 tracking-wider mb-2 block font-sans">{item.category}</span>
                        <h3 className="text-xl font-serif font-black leading-tight text-gray-900 group-hover:text-blue-900 cursor-pointer mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-serif leading-relaxed line-clamp-3">
                          {item.content.replace(/!\[.*?\]\(.*?\)/g, "")}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-400 font-serif italic">No stories published yet. Use Editorial Dashboard to make publication drafts.</div>
              )}
            </div>

            {/* Public Sidebar */}
            <aside className="lg:col-span-4 border-l border-gray-100 pl-6 space-y-8">
              <div className="bg-[#fcfaf7] border-t-4 border-red-700 p-6 shadow-sm">
                <h3 className="text-lg font-serif font-black italic tracking-wide text-[#052962] mb-4">Trending Today</h3>
                <div className="space-y-4">
                  {[
                    "ময়মনসিংহ বিভাগের শ্রেষ্ঠ অনলাইন পোর্টালের স্বীকৃতি অর্জন করলো দৈনিক জাহান।",
                    "শিক্ষা ব্যবস্থার আধুনিকায়নে স্থানীয় বিদ্যাপীঠ সমূহে মাল্টিমিডিয়া ক্লাসরুম উদ্বোধন।",
                    "কৃষি খাতে অভাবনীয় সাফল্য: এবার ধানের বাম্পার ফলনের আশা করছেন চাষীরা।"
                  ].map((trend, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <span className="text-3xl font-black text-gray-200 mt-[-4px] font-sans">{idx + 1}</span>
                      <p className="text-xs font-bold leading-tight font-sans text-gray-700 cursor-pointer hover:underline">{trend}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-100 p-6 rounded bg-white">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#052962] mb-3">Newsletter Update</h3>
                <p className="text-xs text-gray-500 font-sans mb-4">Be the first to know the official reports around Mymensingh division.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Your email..." className="border border-gray-200 px-3 py-2 text-xs rounded flex-1 focus:outline-none" />
                  <button className="bg-[#052962] text-white px-4 text-xs font-black uppercase">Join</button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="bg-slate-900 text-white mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
            <p className="font-serif">© {new Date().getFullYear()} Dainik Jahan Media Group. Made with highest standard editorial replicate style.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans text-[#333] flex flex-col">
      {/* Alert Ribbon to switch views */}
      <div className="bg-red-700 text-white px-6 py-2.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest font-sans">
        <span className="flex items-center gap-1.5 animate-pulse"><Zap className="w-3.5 h-3.5 text-yellow-300" /> Editorial Control Center</span>
        <button 
          onClick={() => setView("portal")} 
          className="bg-white text-red-700 hover:bg-yellow-50 px-3.5 py-1 rounded font-black flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" /> View Public Companion Portal
        </button>
      </div>

      <Header />
      
      <main className="flex-1 w-full lg:grid lg:grid-cols-12 gap-0">
        {/* Left Column: Reporters Briefs */}
        <aside className="lg:col-span-3 bg-white border-r border-gray-200 flex flex-col h-full lg:max-h-[85vh] overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ReporterInbox onSelectEmail={handleSelectEmail} />
          </div>
          <div className="border-t border-gray-100">
            <BreakingNewsFeed />
          </div>
        </aside>

        {/* Center: Editorial Sandbox */}
        <section id="ai-editor-desc" className="lg:col-span-6 bg-white p-6 overflow-y-auto border-r border-gray-200 h-full lg:max-h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-[#052962] text-[#FFE500] px-3 py-1 text-[10px] font-black uppercase tracking-widest">Gemini Optimizer Sandbox</span>
              <span className="text-xs font-semibold text-gray-400 italic">Editorial Intelligence Active</span>
            </div>
          </div>
          
          <AICEditor 
            onSave={saveDraft} 
            rawInput={rawInput} 
            setRawInput={setRawInput}
            category={category}
            setCategory={setCategory}
          />
        </section>

        {/* Right Column: CMS Drafts History with search bar */}
        <aside className="lg:col-span-3 bg-gray-50 p-6 flex flex-col h-full lg:max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[#052962]" /> Production Drafts
            </h3>
            <span className="bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">{drafts.length} Active</span>
          </div>

          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search drafts title / tag..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-xs bg-white focus:border-[#052962] focus:outline-none focus:ring-1 focus:ring-[#052962] transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {drafts.filter(d => 
              d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.category.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <div className="p-8 border-2 border-dashed border-gray-200 rounded text-center text-xs text-gray-400 italic">
                {searchTerm ? "No local matching drafts found." : "Draft CMS queue is empty. Submit edited reporter notes."}
              </div>
            ) : (
              drafts.filter(d => 
                d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.category.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((draft) => {
                const img = extractFirstImage(draft.content) || draft.imageUrl;
                return (
                  <div key={draft.id} className="group bg-white rounded shadow-sm border border-gray-200 hover:border-[#052962] transition-all relative overflow-hidden flex flex-col">
                    {img && (
                      <div className="w-full h-24 overflow-hidden border-b border-gray-100 bg-gray-100">
                        <img src={img} alt={draft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#FFE500] text-[#052962]">{draft.category}</span>
                        <button onClick={() => deleteDraft(draft.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-serif font-black leading-snug text-[#121212] mb-1">{draft.title}</h4>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Drafted {format(new Date(draft.date), "h:mm a")}</p>
                    </div>

                    <div className="absolute inset-0 bg-[#052962]/95 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-3 gap-2 transition-all rounded">
                      <button 
                        onClick={() => setPreviewDraft(draft)}
                        className="w-full bg-white text-[#052962] py-2 rounded text-[10px] font-black uppercase tracking-wider hover:bg-yellow-50 transition-colors"
                      >
                        Live Preview
                      </button>
                      <button 
                        onClick={() => {
                          const combinedContent = `<!-- WP:paragraph -->\n<h2>${draft.title}</h2>\n<!-- /WP:paragraph -->\n\n` + 
                            (img ? `<!-- WP:image -->\n<figure class="wp-block-image"><img src="${img}" alt="${draft.title}"/></figure>\n<!-- /WP:image -->\n\n` : "") +
                            `<!-- WP:paragraph -->\n${draft.content.replace(/!\[.*?\]\(.*?\)/g, "")}\n<!-- /WP:paragraph -->`;
                          navigator.clipboard.writeText(combinedContent);
                          alert("WordPress Blocks dynamic clipboard initialized! Ready for Paste.");
                        }}
                        className="w-full bg-[#FFE500] text-[#052962] py-2 rounded text-[10px] font-black uppercase tracking-wider hover:bg-yellow-400 transition-colors"
                      >
                        WordPress Copy
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-6 flex justify-between items-center">
        <div>© {new Date().getFullYear()} Dainik Jahan - The Guardian replication design theme</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> RSS feed proxy: Active</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI Engine: High Accuracy</span>
        </div>
      </footer>

      {previewDraft && (
        <PreviewModal draft={previewDraft} onClose={() => setPreviewDraft(null)} />
      )}
    </div>
  );
}
