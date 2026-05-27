/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  Award, 
  Terminal, 
  CheckCircle2, 
  Brain, 
  Clock, 
  User, 
  Heart, 
  Bookmark, 
  ChevronRight, 
  Play, 
  Check, 
  Unlock, 
  FileText, 
  HelpCircle, 
  Send, 
  Github, 
  Search, 
  Filter, 
  Info, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight,
  BookMarked
} from "lucide-react";
import { api } from "./services/api";
import { User as UserType, Course, Enrollment, LessonProgress, CareerPath, Level, EnrollStatus } from "./types";
import { SAMPLE_CAREER_PATHS } from "./coursesData";
import UserProfileModal from "./components/UserProfileModal";

export default function App() {
  // Profile & Career State
  const [user, setUser] = useState<UserType | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<(Enrollment & { course: Course })[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [wishlist, setWishlist] = useState<{ id: string; userId: string; courseId: string }[]>([]);
  
  // Recommendations States
  const [userRecs, setUserRecs] = useState<{ course: Course; score: number; diagnostics: string[] }[]>([]);
  const [skillGapRecs, setSkillGapRecs] = useState<{
    pathName: string;
    requiredSkills: string[];
    currentSkills: string[];
    missingSkills: string[];
    recommendations: { course: Course; coveredSkills: string[]; score: number }[];
  } | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Navigation / UI States
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "classroom" | "interview">("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  // Modals & Sliders
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    scorePct: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  // AI Study Coach State
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Simulation Status
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Run initial calculations
  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const [profile, courseList, enrolls, progList, wish] = await Promise.all([
        api.getProfile(),
        api.getCourses(),
        api.getEnrollments(),
        api.getProgress(),
        api.getWishlist()
      ]);

      setUser(profile);
      setCourses(courseList);
      setEnrollments(enrolls);
      setProgress(progList);
      setWishlist(wish);

      // Trigger recommendation computations
      const [userRecList, gapRecs] = await Promise.all([
        api.getUserRecommendations(),
        api.getSkillGapRecommendations()
      ]);
      setUserRecs(userRecList);
      setSkillGapRecs(gapRecs);

    } catch (e) {
      console.error("Error loading MERN database", e);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.enroll(courseId);
      showToastMessage("🎉 Enrolled successfully! Course added to your Classroom.");
      await loadPlatformData();
      // Auto-focus on classroom & select course
      setSelectedCourseId(courseId);
      const courseObj = courses.find(c => c.id === courseId);
      if (courseObj && courseObj.lessons.length > 0) {
        setSelectedLessonId(courseObj.lessons[0].id);
      }
      setActiveTab("classroom");
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWishlist = async (courseId: string) => {
    try {
      const res = await api.toggleWishlist(courseId);
      showToastMessage(res.wishlisted ? "❤️ Added to your personal wishlist" : "💔 Removed from your wishlist");
      const wish = await api.getWishlist();
      setWishlist(wish);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProgress = async (courseId: string, lessonId: string, completed: boolean) => {
    try {
      await api.updateProgress({
        courseId,
        lessonId,
        completed,
        secondsWatched: completed ? 300 : 0
      });
      showToastMessage(completed ? "✅ Lesson marked completed!" : "⏱️ Progress reset");
      await loadPlatformData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFastWatch = async (courseId: string, lessonId: string) => {
    await handleUpdateProgress(courseId, lessonId, true);
    showToastMessage("⚡ Simulated watching 100% video stream!");
  };

  const handleQuizAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...quizAnswers];
    updated[questionIndex] = optionIndex;
    setQuizAnswers(updated);
  };

  const handleQuizSubmit = async (courseId: string, quizId: string) => {
    if (!selectedCourseId) return;
    try {
      const res = await api.submitQuiz({
        courseId,
        quizId,
        answers: quizAnswers
      });
      setQuizResult({
        scorePct: res.scorePct,
        passed: res.passed,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions
      });
      setQuizSubmitted(true);
      
      if (res.passed) {
        showToastMessage("🎓 Certification Unlocked! Core skills automatically added to your profile.");
      } else {
        showToastMessage("⚠️ Pass threshold not met. Review the lessons and try again!");
      }
      await loadPlatformData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleAskCoach = async (topicOverride?: string) => {
    const query = topicOverride || coachQuestion;
    if (!query.trim()) return;

    try {
      setCoachLoading(true);
      setCoachAnswer("");
      
      const contextStr = selectedCourseId 
        ? courses.find(c => c.id === selectedCourseId)?.title || "General Up-skilling"
        : "General Computer Science";

      const res = await api.askAiCoach(query, contextStr);
      setCoachAnswer(res.explanation);
    } catch (e) {
      setCoachAnswer("⚠️ Issue connecting with Gemini engine. Please check your secrets configurations.");
    } finally {
      setCoachLoading(false);
    }
  };

  // Filter computation
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesQuery = searchQuery.trim() === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      course.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesLevel && matchesQuery;
  });

  const getCourseProgressPercentage = (courseId: string) => {
    const courseObj = courses.find(c => c.id === courseId);
    if (!courseObj) return 0;
    const lessonsCount = courseObj.lessons.length;
    if (lessonsCount === 0) return 0;

    const userProg = progress.filter(p => p.courseId === courseId && p.completed);
    return Math.round((userProg.length / lessonsCount) * 100);
  };

  const isLessonCompleted = (courseId: string, lessonId: string) => {
    return progress.some(p => p.courseId === courseId && p.lessonId === lessonId && p.completed);
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  // Find currently active classroom course inside view
  const currentClassroomCourse = courses.find(c => c.id === selectedCourseId);
  const currentClassroomLesson = currentClassroomCourse?.lessons.find(l => l.id === selectedLessonId);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans text-neutral-800 antialiased" id="main-applet-wrapper">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
          id="toast-alert"
        >
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
          <span>{toast}</span>
        </div>
      )}

      {/* Corporate Header Nav */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40" id="global-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl text-white shadow-md shadow-indigo-100" id="platform-logo">
                <Brain size={22} />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-neutral-900 leading-tight tracking-tight">LearnSphere</h1>
                <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">LMS & RECOM ENG</p>
              </div>
            </div>

            {/* Main Tabs */}
            <nav className="hidden md:flex space-x-1" id="nav-tabs-wrapper">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                id="tab-dashboard"
              >
                <Compass size={14} />
                Student Hub
              </button>
              <button 
                onClick={() => setActiveTab("catalog")} 
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  activeTab === "catalog" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                id="tab-catalog"
              >
                <BookOpen size={14} />
                Course Catalog
              </button>
              <button 
                onClick={() => setActiveTab("classroom")} 
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  activeTab === "classroom" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                id="tab-classroom"
              >
                <Play size={14} />
                My Classroom
              </button>
              <button 
                onClick={() => setActiveTab("interview")} 
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  activeTab === "interview" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                id="tab-interview"
              >
                <Terminal size={14} />
                Student Guide & prep
              </button>
            </nav>

            {/* Profile Avatar / Quick Controls */}
            <div className="flex items-center gap-4">
              {user && (
                <div 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/60 p-1.5 pr-3 rounded-full cursor-pointer transition-all"
                  id="user-avatar-btn"
                >
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs font-sans">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[11px] font-bold text-neutral-800 leading-none">{user.name}</p>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5" id="career-pill-badge">
                      {SAMPLE_CAREER_PATHS.find(p => p.id === user.selectedCareerPath)?.title || "Student"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sub-nav block to show on mobile devices since they don't see desktop sidebars */}
      <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-2 flex justify-between gap-1 overflow-x-auto" id="mobile-navigation-bar">
        <button 
          onClick={() => setActiveTab("dashboard")} 
          className={`flex-1 min-w-[70px] text-center py-1.5 rounded-lg text-[11px] font-bold ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500"}`}
        >
          Hub
        </button>
        <button 
          onClick={() => setActiveTab("catalog")} 
          className={`flex-1 min-w-[70px] text-center py-1.5 rounded-lg text-[11px] font-bold ${activeTab === "catalog" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500"}`}
        >
          Catalog
        </button>
        <button 
          onClick={() => setActiveTab("classroom")} 
          className={`flex-1 min-w-[70px] text-center py-1.5 rounded-lg text-[11px] font-bold ${activeTab === "classroom" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500"}`}
        >
          Classroom
        </button>
        <button 
          onClick={() => setActiveTab("interview")} 
          className={`flex-1 min-w-[70px] text-center py-1.5 rounded-lg text-[11px] font-bold ${activeTab === "interview" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500"}`}
        >
          Guide
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3" id="loading-spinner-view">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-500 font-sans">Compiling recommendation vectors & seed databases...</p>
        </div>
      ) : (
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8" id="primary-content-viewport">
          
          {/* ==========================================================
              TAB A: STUDENT HUB (DASHBOARD)
              ========================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-350" id="tab-dashboard-view">
              
              {/* Profile Overview Card / Target Career Roadmap */}
              <div className="bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 relative overflow-hidden shadow-xl" id="dashboard-hero-card">
                {/* Background artistic pattern */}
                <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white via-indigo-200 to-indigo-950"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-4">
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-3 py-1 rounded-full font-mono font-semibold uppercase tracking-wider">
                      Learner Dashboard
                    </span>
                    <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight">Active Curriculum Track</h2>
                    <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
                      Optimize your learning targets. Below is the automated recommendation pipeline matching your profile interests to industry requirements and resolving core code barriers.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-4 py-2 text-xs font-bold bg-white text-indigo-900 rounded-xl hover:bg-neutral-100 transition-all shadow-sm"
                        id="hero-configure-profile-btn"
                      >
                        Adjust Skills & Career Track 
                      </button>
                      <button 
                        onClick={() => setActiveTab("catalog")}
                        className="px-4 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-650 text-white rounded-xl transition-all border border-indigo-600/50"
                        id="hero-explore-catalog-btn"
                      >
                        View Course Catalog →
                      </button>
                    </div>
                  </div>

                  {/* Quick Profile Summary Stats Bar */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 md:min-w-[280px]" id="hero-mini-profile-card">
                    <h4 className="text-xs font-mono font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Live Profile
                    </h4>
                    
                    <div className="mt-3 space-y-2.5">
                      <div>
                        <p className="text-[10px] text-indigo-300">Target Track</p>
                        <p className="text-sm font-bold truncate">
                          {SAMPLE_CAREER_PATHS.find(p => p.id === user?.selectedCareerPath)?.title || "Custom Learner"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-[9px] text-indigo-300">Mastered</p>
                          <p className="text-base font-extrabold text-teal-400">{user?.currentSkills.length || 0} skills</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-indigo-300">Targeting</p>
                          <p className="text-base font-extrabold text-indigo-300">{user?.targetSkills.length || 0} skills</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 1: Diagnostic Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid-cards">
                <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-sm">
                  <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Courses Enrolled</span>
                  <p className="text-2.5xl font-extrabold text-neutral-900 mt-1">{enrollments.length}</p>
                  <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 
                    Active in Classroom
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-sm">
                  <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Completed Certificates</span>
                  <p className="text-2.5xl font-extrabold text-emerald-600 mt-1">
                    {enrollments.filter(e => e.status === EnrollStatus.COMPLETED).length}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                    <Check size={14} /> Taught skills unlocked!
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-sm border-l-3 border-l-amber-500">
                  <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Topic Interests</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {user?.interests.map(int => (
                      <span key={int} className="px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-700 rounded-md font-medium border border-neutral-205">
                        {int}
                      </span>
                    )) || <span className="text-xs text-neutral-500">None selected</span>}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-3 hover:underline cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>Edit categories ✎</p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-sm">
                  <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Wishlisted Item List</span>
                  <p className="text-2.5xl font-extrabold text-rose-600 mt-1">{wishlist.length}</p>
                  <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5" onClick={() => setActiveTab("catalog")}>
                    <Heart size={12} className="text-rose-500 fill-rose-500" /> Save items to review later
                  </p>
                </div>
              </div>

              {/* Recommendation Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-recommendations-split">
                
                {/* Left Side: Hybrid Recommender (content-based interests + collaborative filtering) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Title Block detailing algorithm properties */}
                  <div className="flex justify-between items-center" id="recs-title-bar">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-600" />
                        Personalized "For You" Feed
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Custom Content-Collaborative filtering sorting scoring indexes</p>
                    </div>

                    <button 
                      onClick={loadPlatformData}
                      className="p-2 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 bg-white rounded-xl text-neutral-600 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
                      title="Reload recommendations"
                    >
                      <RefreshCw size={12} />
                      <span className="hidden sm:inline">Refresh Models</span>
                    </button>
                  </div>

                  {userRecs.length === 0 ? (
                    <div className="bg-white border border-dashed border-neutral-300 rounded-3xl p-10 text-center" id="recs-empty-state">
                      <BookMarked className="mx-auto text-neutral-300 mb-2" size={32} />
                      <p className="text-sm font-semibold text-neutral-700">All available courses enrolled!</p>
                      <p className="text-xs text-neutral-400 mt-1">Excellent work. Try adjusting your skills on profile constraints to test co-occurrence matrices.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="recs-feed-grid">
                      {userRecs.map(({ course, score, diagnostics }) => (
                        <div 
                          key={course.id}
                          className="bg-white border border-neutral-200 hover:border-indigo-300 rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col relative group"
                          id={`rec-item-${course.id}`}
                        >
                          {/* Scoring Banner */}
                          <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-[10px] font-mono px-2 py-1 rounded-md font-bold tracking-wider shadow-sm flex items-center gap-1" id={`score-badge-${course.id}`}>
                            <span>Index: {score} pts</span>
                          </div>

                          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-neutral-600 hover:text-rose-600 p-2 rounded-lg cursor-pointer transition-all border border-neutral-100 shadow-sm" onClick={() => handleToggleWishlist(course.id)}>
                            <Heart size={14} className={wishlist.some(w => w.courseId === course.id) ? "fill-rose-500 text-rose-500" : ""} />
                          </div>

                          <img src={course.thumbUrl} className="w-full h-36 object-cover object-center group-hover:scale-[1.02] transition-transform duration-300" alt={course.title} />
                          
                          <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                            <div>
                              <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded uppercase font-semibold">
                                {course.level}
                              </span>
                              <h4 className="text-sm font-extrabold text-neutral-900 mt-2 hover:text-indigo-600 cursor-pointer" onClick={() => {
                                setSelectedCourseId(course.id);
                                setSelectedLessonId(course.lessons[0]?.id || null);
                                setActiveTab("catalog");
                              }}>
                                {course.title}
                              </h4>
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{course.subtitle}</p>
                            </div>

                            {/* Scoring Diagnostics explanation */}
                            <div className="bg-neutral-50 px-3 py-2.5 rounded-xl border border-neutral-200/60" id={`diagnostic-${course.id}`}>
                              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Matching Diagnostics</p>
                              <div className="mt-1 space-y-1">
                                {diagnostics.map((diag, index) => (
                                  <p key={index} className="text-[10px] text-neutral-600 flex items-start gap-1 leading-normal">
                                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                                    <span>{diag}</span>
                                  </p>
                                ))}
                              </div>
                            </div>

                            <button 
                              onClick={() => handleEnroll(course.id)}
                              className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-bold rounded-xl transition-all border border-indigo-100"
                              id={`enroll-rec-btn-${course.id}`}
                            >
                              Enroll Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enrolled Courses Progress Bar panel */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4" id="enrolled-dashboard-list">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <BookOpen size={16} className="text-neutral-500" />
                      Ongoing Subject Classrooms ({enrollments.length})
                    </h3>

                    {enrollments.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-xs text-neutral-400">Not enrolled in any courses yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enrollments.map((enr) => {
                          const progressPct = getCourseProgressPercentage(enr.courseId);
                          return (
                            <div 
                              key={enr.id} 
                              className="flex flex-col sm:flex-row justify-between sm:items-center p-3 border border-neutral-100 bg-neutral-50 rounded-xl hover:border-neutral-300 transition-all gap-4"
                            >
                              <div className="flex-grow">
                                <p className="text-xs font-extrabold text-neutral-900 truncate max-w-[280px]">
                                  {enr.course?.title}
                                </p>
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 ${
                                  enr.status === EnrollStatus.COMPLETED 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {enr.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 min-w-[200px]" id={`progress-meter-${enr.courseId}`}>
                                <div className="flex-grow bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                                </div>
                                <span className="text-xs font-mono font-bold min-w-[28px]">{progressPct}%</span>
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(enr.courseId);
                                    const cLessons = enr.course?.lessons || [];
                                    setSelectedLessonId(cLessons[0]?.id || null);
                                    setActiveTab("classroom");
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all"
                                >
                                  Resume
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Skill Gap recommender */}
                <div className="space-y-6">
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4" id="skillgap-container">
                    
                    <div className="border-b border-neutral-100 pb-3">
                      <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-500" />
                        Career Skill-Gap Analyzer
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Bridging differences in your target roadmap</p>
                    </div>

                    {skillGapRecs ? (
                      <div className="space-y-5">
                        
                        {/* Target Road Map */}
                        <div className="bg-amber-500/5 rounded-xl border border-amber-300/30 p-3">
                          <p className="text-[10px] font-mono text-amber-600 uppercase font-bold">Target Track Selected</p>
                          <p className="text-sm font-extrabold text-neutral-950 mt-1">{skillGapRecs.pathName}</p>
                        </div>

                        {/* Gap Analysis checklist */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-widest">Skill Checklist</p>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1" id="skillgap-checklist">
                            {skillGapRecs.requiredSkills.map((skill) => {
                              const hasSkill = skillGapRecs.currentSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                              return (
                                <div key={skill} className="flex justify-between items-center text-xs p-1" id={`skillgap-item-${skill}`}>
                                  <span className={hasSkill ? "text-neutral-500" : "text-neutral-900 font-medium"}>
                                    {skill}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    hasSkill 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                                      : "bg-red-50 text-red-700 border border-red-150"
                                  }`}>
                                    {hasSkill ? "MASTERED" : "GAP"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recommendations mapping exact tools */}
                        <div className="space-y-3 border-t border-neutral-100 pt-3">
                          <p className="text-[10px] font-mono text-indigo-600 uppercase font-bold tracking-widest flex items-center gap-1">
                            🚀 Missing Gaps Solutions ({skillGapRecs.recommendations.length})
                          </p>

                          {skillGapRecs.recommendations.length === 0 ? (
                            <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                              Congrats! You have enrolled or completed all courses covering skills required for this career path. Recalibrate your career goals or select another roadmap to continue.
                            </p>
                          ) : (
                            <div className="space-y-2.5">
                              {skillGapRecs.recommendations.map(({ course, coveredSkills, score }) => (
                                <div 
                                  key={course.id}
                                  className="p-3 border border-neutral-200/80 bg-neutral-50 hover:bg-neutral-100/50 rounded-xl transition-all space-y-2"
                                  id={`gap-solution-${course.id}`}
                                >
                                  <div>
                                    <p className="text-xs font-bold text-neutral-900 hover:text-indigo-600 cursor-pointer" onClick={() => {
                                      setSelectedCourseId(course.id);
                                      setSelectedLessonId(course.lessons[0]?.id || null);
                                      setActiveTab("catalog");
                                    }}>
                                      {course.title}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {coveredSkills.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-medium border border-amber-200">
                                          Resolves: {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center text-[10px] pt-1">
                                    <span className="font-mono text-neutral-400 font-bold">Score Lift: +{score} pts</span>
                                    <button 
                                      onClick={() => handleEnroll(course.id)}
                                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg transition-all"
                                    >
                                      Quick Enroll
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">Formulating recommendations...</p>
                    )}
                  </div>

                  {/* Virtual Interactive Seed Simulation statistics block */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3" id="database-seed-metrics">
                    <span className="text-[10px] bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded font-mono font-bold text-neutral-600">
                      SEED DATABASE VERIFICATION
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 mt-2">Collaborative Filtering Seeds</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      To simulate multi-user similarity mapping, we have loaded **5 inactive guest student entries** and **10 historical enrollment files** into our runtime memory buffers.
                    </p>
                    
                    <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Seed user records</span>
                      <span className="font-mono font-bold">5 accounts</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Active enrollments</span>
                      <span className="font-mono font-bold">10 entries</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================================
              TAB B: COURSE CATALOG
              ========================================================== */}
          {activeTab === "catalog" && (
            <div className="space-y-6 animate-in fade-in duration-350" id="tab-catalog-view">
              
              {/* Header Title */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Enterprise Syllabus Catalog</h2>
                <p className="text-sm text-neutral-500 mt-1">Browse courses, filter targets and explore comprehensive study guides</p>
              </div>

              {/* Filtering Utilities */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center" id="catalog-filters-bar">
                
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords, skills (React, TF) or tags..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-neutral-800 transition-all font-sans"
                    id="search-catalog-box"
                  />
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto" id="pills-filters-list">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                    <Filter size={12} /> Filters:
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    id="category-filter-select"
                  >
                    <option value="All">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>

                  {/* Level Filter */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-1.5 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    id="level-filter-select"
                  >
                    <option value="All">All Difficulty Levels</option>
                    <option value={Level.BEGINNER}>Beginner</option>
                    <option value={Level.INTERMEDIATE}>Intermediate</option>
                    <option value={Level.ADVANCED}>Advanced</option>
                  </select>
                </div>
              </div>

              {/* Catalog Grid */}
              {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center" id="catalog-empty-view">
                  <Info className="mx-auto text-neutral-400 mb-2" size={32} />
                  <p className="text-sm font-semibold text-neutral-700">No matching courses resolved</p>
                  <p className="text-xs text-neutral-400 mt-1">Try resetting search filters or key parameters.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedLevel("All");
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-150 hover:bg-indigo-100 transition-all font-sans"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-courses-grid">
                  {filteredCourses.map((course) => {
                    const enrolled = isEnrolled(course.id);
                    const wishlisted = wishlist.some(w => w.courseId === course.id);
                    return (
                      <div 
                        key={course.id}
                        className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all h-full"
                        id={`catalog-item-${course.id}`}
                      >
                        {/* Course Header Thumbnail */}
                        <div className="relative">
                          <img src={course.thumbUrl} className="w-full h-44 object-cover object-center" alt={course.title} />
                          
                          {/* Heart/Wishlist toggle button */}
                          <button 
                            onClick={() => handleToggleWishlist(course.id)}
                            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl text-neutral-600 hover:text-rose-600 transition-all shadow border border-neutral-100 focus:outline-none"
                            id={`catalog-wishlist-${course.id}`}
                          >
                            <Heart size={14} className={wishlisted ? "fill-rose-500 text-rose-500" : ""} />
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded">
                                {course.level}
                              </span>
                              <span className="text-xs text-neutral-400 font-sans">{course.category}</span>
                            </div>

                            <h3 className="font-extrabold text-neutral-950 text-base leading-snug group-hover:text-indigo-600">
                              {course.title}
                            </h3>

                            <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">{course.desc}</p>

                            {/* Skills taught badge row */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {course.skills.map((skill) => (
                                <span key={skill} className="px-2 py-0.5 text-[10px] font-sans font-medium bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-neutral-100 mt-5 pt-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-[10px] text-neutral-400">Author</p>
                              <p className="text-xs font-bold text-neutral-800">{course.author}</p>
                            </div>

                            <button
                              onClick={() => {
                                if (enrolled) {
                                  setSelectedCourseId(course.id);
                                  setSelectedLessonId(course.lessons[0]?.id || null);
                                  setActiveTab("classroom");
                                } else {
                                  handleEnroll(course.id);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all ${
                                enrolled 
                                  ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150" 
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                              }`}
                              id={`enroll-btn-${course.id}`}
                            >
                              {enrolled ? "Resume study ➔" : "Enroll now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ==========================================================
              TAB C: MY CLASSROOM (REST RESTRICTED API PLATFORM)
              ========================================================== */}
          {activeTab === "classroom" && (
            <div className="space-y-6 animate-in fade-in duration-350" id="tab-classroom-view">
              
              {/* Header Title */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Active Learning Workspace</h2>
                <p className="text-sm text-neutral-500 mt-1">Experience live multi-layered courses, complete assessments, and invoke Gemini AI tutoring</p>
              </div>

              {enrollments.length === 0 ? (
                <div className="bg-white border rounded-3xl p-12 text-center space-y-4" id="classroom-empty-view">
                  <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Workspace is empty</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    You must enroll in courses inside the Course Catalog tab or using target dashboard recommendation prompts to activate classroom features.
                  </p>
                  <button 
                    onClick={() => setActiveTab("catalog")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Browse Catalog Now
                  </button>
                </div>
              ) : !selectedCourseId ? (
                // Enrolled but didn't choose actively from state
                <div className="bg-white border rounded-3xl p-10 text-center" id="no-selected-course">
                  <p className="text-sm text-neutral-700 font-semibold">Please select one of your active study monitors to begin:</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {enrollments.map((enr) => (
                      <button
                        key={enr.id}
                        onClick={() => {
                          setSelectedCourseId(enr.courseId);
                          setSelectedLessonId(enr.course?.lessons[0]?.id || null);
                        }}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl text-xs font-bold"
                      >
                        {enr.course?.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Full Workspace Split panel
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start" id="split-workspace-panel">
                  
                  {/* Sidebar 1: Lessons List & Course Navigation */}
                  <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                    
                    {/* Course Header meta */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3">
                      <span className="text-[9px] font-mono font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2   py-0.5 rounded">
                        Classroom Select
                      </span>

                      <div className="space-y-1">
                        <select
                          value={selectedCourseId}
                          onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            const targeted = courses.find(c => c.id === e.target.value);
                            setSelectedLessonId(targeted?.lessons[0]?.id || null);
                            handleResetQuiz();
                          }}
                          className="w-full text-xs font-bold p-1.5 border border-neutral-200 rounded bg-white"
                          id="classroom-course-dropdown"
                        >
                          {enrollments.map(enr => (
                            <option key={enr.courseId} value={enr.courseId}>
                              {enr.course?.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-neutral-50 p-2 border border-neutral-150 rounded-xl text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Progress:</span>
                          <span className="font-bold">{getCourseProgressPercentage(selectedCourseId)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total Lessons:</span>
                          <span className="font-mono">{currentClassroomCourse?.lessons.length} articles</span>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Index list */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-neutral-900 border-b pb-2">Lessons list</h4>
                      
                      <div className="space-y-1">
                        {currentClassroomCourse?.lessons.map((lesson) => {
                          const completed = isLessonCompleted(selectedCourseId, lesson.id);
                          const isActive = selectedLessonId === lesson.id;
                          return (
                            <div 
                              key={lesson.id}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-all ${
                                isActive 
                                  ? "bg-indigo-50 border border-indigo-150 text-indigo-900 font-bold" 
                                  : "hover:bg-neutral-50 text-neutral-700"
                              }`}
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                handleResetQuiz();
                              }}
                              id={`lesson-selector-${lesson.id}`}
                            >
                              <div className="flex items-center gap-2 truncate max-w-[200px]" id={`lesson-title-panel-${lesson.id}`}>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateProgress(selectedCourseId, lesson.id, !completed);
                                  }}
                                  className={`p-1 rounded-md border ${
                                    completed 
                                      ? "bg-emerald-500 border-emerald-600 text-white" 
                                      : "border-neutral-300"
                                  }`}
                                  id={`checkbox-lesson-${lesson.id}`}
                                >
                                  <Check size={10} />
                                </button>
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono flex items-center shrink-0">
                                {lesson.durationMin}m
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz Button Trigger */}
                      {currentClassroomCourse?.quiz && (
                        <div className="pt-2 border-t border-neutral-100">
                          <button
                            onClick={() => {
                              setSelectedLessonId("QUIZ_PORTAL");
                              handleResetQuiz();
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 border ${
                              selectedLessonId === "QUIZ_PORTAL"
                                ? "bg-amber-500 border-amber-600 text-neutral-950"
                                : "bg-white border-amber-300 text-amber-700 hover:bg-neutral-50"
                            }`}
                            id="quiz-portal-trigger-btn"
                          >
                            <Award size={14} />
                            Final assessment Quiz
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Return to student dashboard list */}
                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900 border border-neutral-200 bg-white p-2.5 rounded-xl transition"
                    >
                      ⟠ Back to Student Hub
                    </button>
                  </div>

                  {/* Middleware workspace panel (2/2 layout) */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 overflow-hidden space-y-6 order-1 lg:order-2" id="classroom-player-viewport">
                    
                    {selectedLessonId === "QUIZ_PORTAL" ? (
                      // RENDER QUIZ BLOCK
                      <div className="space-y-6" id="classroom-quiz-block">
                        <div className="border-b border-neutral-100 pb-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase tracking-widest leading-normal">
                            Skill Gate Assessment
                          </span>
                          <h3 className="text-xl font-black text-neutral-950 tracking-tight mt-2">
                            {currentClassroomCourse?.quiz?.title}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1">
                            Requires **100% correct answers** to unlock certification and master the skills list: {currentClassroomCourse?.skills.join(", ")};
                          </p>
                        </div>

                        {!quizSubmitted ? (
                          <div className="space-y-6" id="unsubmitted-quiz-view">
                            {currentClassroomCourse?.quiz?.questions.map((q, qIndex) => (
                              <div key={qIndex} className="space-y-3 bg-neutral-50 border border-neutral-200/80 p-4 rounded-xl" id={`quiz-q-${qIndex}`}>
                                <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                                  Question {qIndex + 1}: {q.q}
                                </h4>
                                <div className="space-y-2 grid grid-cols-1">
                                  {q.options.map((opt, oIndex) => {
                                    const isChecked = quizAnswers[qIndex] === oIndex;
                                    return (
                                      <div 
                                        key={oIndex}
                                        onClick={() => handleQuizAnswerSelect(qIndex, oIndex)}
                                        className={`p-3 text-xs rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                          isChecked 
                                            ? "border-amber-500 bg-amber-50/40 font-semibold text-neutral-950" 
                                            : "border-neutral-200 hover:border-neutral-300 hover:bg-white"
                                        }`}
                                        id={`q-${qIndex}-option-${oIndex}`}
                                      >
                                        <span>{opt}</span>
                                        {isChecked && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                              💡 Completing this quiz successfully will auto-write those skills into your master database profile, correcting career gaps.
                            </div>

                            <button
                              onClick={() => {
                                if (currentClassroomCourse?.quiz) {
                                  handleQuizSubmit(currentClassroomCourse.id, currentClassroomCourse.quiz.id);
                                }
                              }}
                              disabled={quizAnswers.length < (currentClassroomCourse?.quiz?.questions.length || 0)}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                              id="submit-quiz-button"
                            >
                              Submit Quiz Answers
                            </button>
                          </div>
                        ) : (
                          // SHOW QUIZ RESULTS
                          <div className="space-y-6 text-center py-6" id="quiz-results-display">
                            
                            {quizResult?.passed ? (
                              <div className="space-y-3" id="quiz-success-block">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                  <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-lg font-black text-neutral-950">Excellent Score Passed!</h4>
                                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                                  Congratulations! You scored {quizResult.scorePct}%. Standard full-stack certificate is issued. Skills: **{currentClassroomCourse?.skills.join(", ")}** have been fully mastered and written to your profile profile.
                                </p>
                                
                                {/* Mock Dynamic Certificate */}
                                <div className="max-w-md mx-auto p-5 border-4 border-double border-indigo-700 bg-indigo-50/20 rounded-xl text-center space-y-3 mt-4 shadow-sm" id="certificate-preview">
                                  <span className="text-[10px] text-indigo-700 font-mono font-bold tracking-widest uppercase">CERTIFICATE OF COMPLETION</span>
                                  <h4 className="font-extrabold text-xs text-neutral-900 uppercase tracking-tight">{user?.name}</h4>
                                  <p className="text-[10px] text-neutral-500 max-w-[280px] mx-auto">is awarded validation as qualified specialist in</p>
                                  <h5 className="font-extrabold text-sm text-indigo-900 leading-snug">{currentClassroomCourse?.title}</h5>
                                  <div className="border-t border-neutral-200/80 pt-2 text-[8px] text-neutral-400 font-mono">
                                    VERIFICATION SEC CODE ID: {Date.now()}-LMS
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 animate-in shake duration-350" id="quiz-fail-block">
                                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                                  ✕
                                </div>
                                <h4 className="text-lg font-bold text-rose-700">Quiz Incomplete</h4>
                                <p className="text-xs text-neutral-500">
                                  You scored {quizResult?.scorePct}%. Correct answers: {quizResult?.correctCount} of {quizResult?.totalQuestions}. Keep study and review.
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 justify-center pt-4" id="quiz-followup-actions">
                              <button
                                onClick={handleResetQuiz}
                                className="px-5 py-2 hover:bg-neutral-100 border rounded-xl text-xs font-semibold bg-white"
                              >
                                Try Again
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLessonId(currentClassroomCourse?.lessons[0]?.id || null);
                                  handleResetQuiz();
                                }}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                              >
                                Back to Lessons
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : currentClassroomLesson ? (
                      // RENDER CORE LESSON LAYOUT
                      <div className="space-y-6" id="classroom-lesson-view">
                        
                        {/* Course header */}
                        <div className="border-b border-neutral-100 pb-4 flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-mono bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded leading-normal border text-neutral-500">
                              Lesson {currentClassroomLesson.order} of {currentClassroomCourse?.lessons.length}
                            </span>
                            <h3 className="text-lg font-bold text-neutral-950 mt-1 leading-snug">
                              {currentClassroomLesson.title}
                            </h3>
                          </div>

                          <div className="flex shrink-0 gap-1.5 pt-1">
                            {/* Fast simulations watch marker */}
                            <button
                              onClick={() => handleFastWatch(selectedCourseId, currentClassroomLesson.id)}
                              className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold"
                              title="Simulate 100% video stream seconds"
                              id="simulate-video-btn"
                            >
                              ⚡ Simulate Video
                            </button>
                          </div>
                        </div>

                        {/* Interactive Lecture Video Sim */}
                        <div className="aspect-video bg-neutral-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4" id="simulated-player-canvas">
                          <div className="flex justify-between items-center text-white/80 text-[10px] font-mono">
                            <span>📹 VIDEO LECTURESTREAM ACTIVE</span>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                              <span>LIVE RESOLUTION</span>
                            </div>
                          </div>

                          {/* Centered Controls Icon */}
                          <div className="self-center flex flex-col items-center gap-2 text-center text-white/90">
                            <div className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center cursor-pointer transition-all">
                              <Play size={24} className="fill-white translate-x-0.5" />
                            </div>
                            <p className="text-xs">Dynamic Video Simulator ({currentClassroomLesson.durationMin}:00m)</p>
                          </div>

                          {/* Progress watchers stats bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-white/70 text-[9px]">
                              <span>Lesson Watch Status: {isLessonCompleted(selectedCourseId, currentClassroomLesson.id) ? "Complete (100%)" : "In Progress"}</span>
                              <span>{isLessonCompleted(selectedCourseId, currentClassroomLesson.id) ? `${currentClassroomLesson.durationMin}m` : "0:00m"}</span>
                            </div>
                            <div className="bg-white/20 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-1.5 rounded-full ${
                                isLessonCompleted(selectedCourseId, currentClassroomLesson.id) ? "bg-emerald-500 w-full" : "bg-indigo-500 w-1/12"
                              }`}></div>
                            </div>
                          </div>
                        </div>

                        {/* Lecture Notes markdown wrapper */}
                        <div className="prose prose-neutral max-w-none space-y-4" id="markdown-lecture-notes">
                          <div className="flex items-center gap-2 font-bold text-xs text-neutral-400 border-b pb-2">
                            <FileText size={14} /> LECTURE READING MATERIAL
                          </div>

                          {/* Renders basic structured mock-markdown content cleanly */}
                          <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-4 bg-neutral-50/50 p-4 rounded-xl border">
                            {currentClassroomLesson.contentMd.split('\n\n').map((para, pIdx) => {
                              if (para.startsWith('###')) {
                                return (
                                  <h4 key={pIdx} className="text-sm font-extrabold text-neutral-900 pt-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    {para.replace('###', '').trim()}
                                  </h4>
                                );
                              }
                              if (para.startsWith('####')) {
                                return (
                                  <h5 key={pIdx} className="text-xs font-bold text-neutral-800 pt-1">
                                    {para.replace('####', '').trim()}
                                  </h5>
                                );
                              }
                              if (para.startsWith('1.') || para.startsWith('-')) {
                                return (
                                  <ul key={pIdx} className="list-disc pl-5 space-y-1 bg-white p-2.5 rounded-lg border border-neutral-100">
                                    {para.split('\n').map((line, lIdx) => (
                                      <li key={lIdx} className="text-xs text-neutral-600">
                                        {line.replace(/^-\s*|^\d+\.\s*/, '').trim()}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              if (para.includes('```')) {
                                return (
                                  <pre key={pIdx} className="bg-neutral-900 text-rose-400 font-mono p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed select-all">
                                    <code>{para.replace(/```[a-z]*/g, '').trim()}</code>
                                  </pre>
                                );
                              }
                              return <p key={pIdx} className="leading-normal">{para}</p>;
                            })}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">Retrieving lessons database...</p>
                    )}

                  </div>

                  {/* Sidebar 2: AI Study Coach & Smart Recommender widgets (1/4 layout) */}
                  <div className="lg:col-span-1 space-y-4 order-3 lg:order-3">
                    
                    {/* Gemini AI Coach controller */}
                    <div className="bg-indigo-950 text-white rounded-2xl p-4.5 shadow-md border border-indigo-900/60 space-y-3 flex flex-col" id="gemini-tutor-container">
                      <div className="border-b border-indigo-900 pb-2">
                        <span className="text-[8px] tracking-widest font-mono font-bold text-indigo-300 uppercase">GEMINI COGNITIVE TUTOR</span>
                        <h4 className="text-sm font-bold flex items-center gap-1.5 mt-1">
                          <Brain size={14} className="text-indigo-400 animate-pulse" />
                          AI Study Coach
                        </h4>
                      </div>

                      <p className="text-[11px] text-indigo-200 leading-normal">
                        Stuck on a code blocker? Direct query Gemini below for explanation reviews.
                      </p>

                      {/* Quick Prompt shortcuts based on context */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-indigo-300 font-bold uppercase">Topic Shortcuts:</p>
                        <button 
                          onClick={() => handleAskCoach("Explain JSON Web Token Route Guards")}
                          className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-indigo-300 truncate"
                        >
                          ➔ Explain JWT Route Guards
                        </button>
                        <button 
                          onClick={() => handleAskCoach("Why use prepared statements for SQL defenses?")}
                          className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-indigo-300 truncate"
                        >
                          ➔ Why Prepared Statements?
                        </button>
                        <button 
                          onClick={() => handleAskCoach("What are D3.js svg enter loops?")}
                          className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-indigo-300 truncate"
                        >
                          ➔ D3.js SVG Enter Loops
                        </button>
                      </div>

                      {/* Query Input */}
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={coachQuestion}
                          onChange={(e) => setCoachQuestion(e.target.value)}
                          placeholder="Ask AI Coach a question..."
                          rows={2}
                          className="w-full p-2 bg-indigo-900/40 opacity-90 border border-indigo-805 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 text-white placeholder-indigo-400"
                        />
                        <button
                          onClick={() => handleAskCoach()}
                          disabled={coachLoading || !coachQuestion.trim()}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          {coachLoading ? "Consulting..." : <><Send size={11} /> Send</>}
                        </button>
                      </div>

                      {/* Coach responses panels */}
                      {coachAnswer && (
                        <div className="bg-white/5 border border-indigo-800 rounded-xl p-3 max-h-[220px] overflow-y-auto" id="coach-response">
                          <p className="text-[9px] font-mono font-bold text-teal-400 uppercase">AI Answer:</p>
                          <p className="text-[10px] text-indigo-100 mt-1 leading-relaxed whitespace-pre-wrap">{coachAnswer}</p>
                        </div>
                      )}
                    </div>

                    {/* Similar course items recommender */}
                    {selectedCourseId && (
                      <SimilarRecommendationsWidget courseId={selectedCourseId} onSelectCourse={(id) => {
                        setSelectedCourseId(id);
                        const courseObj = courses.find(c => c.id === id);
                        setSelectedLessonId(courseObj?.lessons[0]?.id || null);
                        handleResetQuiz();
                      }} />
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==========================================================
              TAB D: COURSE EXPLANATION & INTERVIEW PREPARATION
              ========================================================== */}
          {activeTab === "interview" && (
            <div className="space-y-6 animate-in fade-in duration-350" id="tab-interview-view">
              
              {/* Header */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Full-Stack Edtech Project Portfolio Guide</h2>
                <p className="text-sm text-neutral-500 mt-1">Review core algorithmic architecture and interview questions compiled for recruitment success.</p>
              </div>

              {/* Grid split panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="interview-split-grid">
                
                {/* Left Side: Technical explainer of algorithms */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Conceptual overview card */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4" id="concept-overview">
                    <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                      <Terminal size={18} className="text-indigo-600" />
                      1. Simple vs. Advanced Recommender Architectures
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150 space-y-2">
                        <span className="text-[9px] font-mono font-bold bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                          SIMPLE CONTENT MODEL
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 mt-1">Tag & Category Intersect</h4>
                        <p className="text-xs text-neutral-500 leading-normal">
                          Performs boolean filtering checks. Checks if course tags overlap with user interests listed in profile arrays. Uses simple scalar matching (e.g., matching "Web Development" category earns +40 index points).
                        </p>
                      </div>

                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150 space-y-2">
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 px-1.5 py-0.5 text-indigo-700 rounded">
                          ADVANCED CO-OCCURRENCE METRIC
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 mt-1">Collaborative Filter Mining</h4>
                        <p className="text-xs text-neutral-500 leading-normal">
                          Looks at co-enrollments. Checks which peers registered in the same courses as the active student. Then mining what other courses those peers subsequently chose, calculating peer frequent overlaps (+25 score lift).
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-150 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-indigo-600" />
                        Analyzing Skill Gap Alignment Formulas
                      </h4>
                      <p className="text-xs text-indigo-900 leading-normal">
                        To compute career recommendations, the server grabs the selected profile timeline skills (e.g. "React", "Express", "MongoDB" for Full Stack track). It runs subtraction arrays, isolating **missing skills** currently absent from the user's mastered bag. It then scans our course index files, prioritizing syllabi with high alignment offsets.
                      </p>
                    </div>
                  </div>

                  {/* Day-Wise checklist */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4" id="daywise-checklist">
                    <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Award size={18} className="text-emerald-500" />
                      2. Day-Wise Proof of Work Implementation Log
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { day: "Day 1", title: "Decoupled Single Page Frontend Workspace setup", commit: "feat: scaffold react workspace and tailwind configurations" },
                        { day: "Day 2", title: "Express Server routing initialization & middleware structure", commit: "feat: initialize express server listening on portal 3000" },
                        { day: "Day 3", title: "Pragmatic Local Database Schemas & static course lists", commit: "feat: define typescript interfaces and courses static records" },
                        { day: "Day 4", title: "Mock Authentication profile updating parameters", commit: "feat: create mock profile fetcher routes and career paths" },
                        { day: "Day 5", title: "Active Classroom lesson progress indexer tracking", commit: "feat: wire lesson complete tick controls and progress storage" },
                        { day: "Day 6", title: "Cognitive AI tutor grounding using server-side Gemini 3.5 Flash", commit: "feat: build api explain post route leveraging google genai sdk" },
                        { day: "Day 7", title: "Hybrid recommendations formula math integration", commit: "feat: construct content collaborative and skill gap recommend endpoints" },
                        { day: "Day 8", title: "GitHub documentation compiling & expert testing checks", commit: "docs: complete readme syllabus guide and proof outcomes details" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start p-3 border border-neutral-100 bg-neutral-50/50 rounded-xl gap-4">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                              {item.day}
                            </span>
                            <h4 className="text-xs font-bold text-neutral-900 mt-1">{item.title}</h4>
                            <p className="text-[11px] text-neutral-400 font-mono mt-1">Recommended Commit: "{item.commit}"</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-bold shrink-0">✓ READY</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Side: 10 Interview questions */}
                <div className="space-y-4" id="interview-prep-questions">
                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="border-b pb-2">
                      <h4 className="text-sm font-bold text-neutral-905 flex items-center gap-1.5">
                        <HelpCircle size={16} className="text-indigo-600" />
                        3. Complete HR & Technical Interview Prep
                      </h4>
                      <p className="text-[10px] text-neutral-400">Common ed-tech/full-stack team evaluation topics</p>
                    </div>

                    <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                      
                      {/* Q1: Explain Project */}
                      <div className="space-y-1.5 border-b pb-3 border-neutral-100">
                        <p className="text-xs font-bold text-neutral-950">Q1: "Explain your project."</p>
                        <p className="text-xs text-indigo-700 font-semibold bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                          🌟 MUST READ ANSWER FOR RECRUITERS:
                        </p>
                        <p className="text-xs text-neutral-500 leading-normal">
                          "I developed a decoupled, full-stack Online Learning and Recommendation Platform designed to lower attrition in MOOC websites. Built using TypeScript client routing coupled to clean Express REST APIs, the system parses student profiles to dynamically recommend catalogs across three dimensions: Topic category matching (user interests), Target gaps filling (career milestone skill sets), and Collaborative peer co-enrollment co-occurrences. It features interactive quizzing checkpoints, automatic profile status updating, and integrates a server-side Gemini 3.5 Flash AI study coach so students can instantly clear code barriers during lectures."
                        </p>
                      </div>

                      {/* Q2: How recommendations scoring works */}
                      <div className="space-y-1.5 border-b pb-3 border-neutral-100">
                        <p className="text-xs font-bold text-neutral-950">Q2: "How does the hybrid recommendation model calculate weight values?"</p>
                        <p className="text-xs text-neutral-500 leading-normal">
                          "Our server assigns dynamic diagnostic indexes: matching a student's interest category yields +40 points; matching required career roadmap skills adds key +15 points per overlapping skill; and matching collaborative co-occurrences adds +25 points. This is sorted in descending score arrays before rendering."
                        </p>
                      </div>

                      {/* Q3: Why JWT stateless */}
                      <div className="space-y-1.5 border-b pb-3 border-neutral-100">
                        <p className="text-xs font-bold text-neutral-950">Q3: "Why choose stateless JWT instead of server sessions?"</p>
                        <p className="text-xs text-neutral-500 leading-normal">
                          "Stateless JWT eliminates active session memory allocations. Identity claims are encrypted into the token payload itself, which is signed with a server secret to prevent tampered inputs."
                        </p>
                      </div>

                      {/* Q4: Gemini integration security */}
                      <div className="space-y-1.5 border-b pb-3 border-neutral-100">
                        <p className="text-xs font-bold text-neutral-950">Q4: "Why call the Gemini SDK on the server-side?"</p>
                        <p className="text-xs text-neutral-500 leading-normal">
                          "Keeping API client calls strictly server-side shields sensitive headers and keeps key credentials hidden from unauthorized browser inspection scopes."
                        </p>
                      </div>

                      {/* Q5: SQL injection defense */}
                      <div className="space-y-1.5 border-b pb-3 border-neutral-100">
                        <p className="text-xs font-bold text-neutral-950">Q5: "How does parameterization prevent SQL Injection?"</p>
                        <p className="text-xs text-neutral-500 leading-normal">
                          "Prepared parameter arrays isolate user inputs as string/integer literals instead of splicing them directly as executable query lines, preventing arbitrary commands insertion."
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      )}

      {/* Corporate footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12 py-10" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-neutral-500">
          <div className="text-center md:text-left space-y-1">
            <p className="text-xs font-bold text-neutral-900">Online Learning & Course Recommendation Project</p>
            <p className="text-[10px] text-neutral-400">Classroom portfolio proof program. Dynamic content calculations triggered visually.</p>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-mono">STATUS: SIM ENGINE LIVE</span>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </footer>

      {/* Interactive Modal components */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onProfileUpdated={loadPlatformData} 
      />

    </div>
  );
}

// ==========================================
// COMPONENT: SIMILAR RECOMMENDATIONS WIDGET
// ==========================================
interface SimilarRecommendationsWidgetProps {
  courseId: string;
  onSelectCourse: (id: string) => void;
}

function SimilarRecommendationsWidget({ courseId, onSelectCourse }: SimilarRecommendationsWidgetProps) {
  const [items, setItems] = useState<{ course: Course; score: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSimilar();
  }, [courseId]);

  const loadSimilar = async () => {
    try {
      setLoading(true);
      const list = await api.getSimilarRecommendations(courseId);
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-20 bg-neutral-100 rounded-xl animate-pulse"></div>;
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-4.5 shadow-sm space-y-3" id="similar-recs-widget">
      <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 border-b pb-2">
        <Sparkles size={13} className="text-indigo-600" />
        "Because you watch this..."
      </h4>
      <div className="space-y-2.5" id="similar-recs-list">
        {items.map(({ course, score }) => (
          <div 
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className="flex gap-3 hover:bg-neutral-50 p-1.5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-neutral-200"
            id={`similar-item-${course.id}`}
          >
            <img src={course.thumbUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" alt={course.title} />
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{course.title}</p>
              <p className="text-[10px] text-neutral-400 mt-1">{course.category} • Matching score: {score}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
