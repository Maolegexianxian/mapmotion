/**
 * 首页组件
 * 展示产品介绍、功能特性和快速开始入口
 * 风格：Raphael (Modern, Dark, Neon, Glassmorphism)
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Map as MapIcon, 
  Route, 
  Download, 
  Play,
  Zap,
  Globe,
  Layers,
  CheckCircle,
  Share2,
  Monitor,
  type LucideIcon,
  Check,
  Plus,
  Minus
} from 'lucide-react';

import { ROUTES } from '@/routes';
import { Seo } from '@/components/common/Seo';
import { EditorPreview } from '@/components/home/EditorPreview';
import { TEMPLATES } from '@/constants/templates';
import { TemplateCard } from '@/components/common/TemplateCard';

/**
 * HomePage - 首页组件
 */
export default function HomePage() {
  useTranslation();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // 模拟登录状态，实际项目中应从 Auth Context 获取
  const isAuthenticated = false;

  // SEO Keywords Strategy
  const seoKeywords = [
    'map animation software',
    'travel route maker',
    '3d map video generator',
    'geolayers alternative',
    'animated map visualization',
    'route video creator',
    'map motion graphics',
    'gpx to video'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary-500/30">
      <Seo 
        title="MapMotion - #1 Online 3D Map Animation Maker & Video Generator" 
        description="Create professional 3D map animations in your browser. The best GeoLayers alternative for travel vlogs, documentaries, and journalism. Export 4K video instantly."
        keywords={seoKeywords}
      />
      {/* 背景光效 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-primary-600/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-accent-600/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo - 新设计：纯色、扁平、高对比度 */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group" aria-label="MapMotion Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-600/20 transition-transform group-hover:scale-105">
              <MapIcon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              MapMotion
            </span>
          </Link>

          {/* 导航链接 */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to={ROUTES.TEMPLATES}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Templates
            </Link>
            
            {/* 只有登录后才显示 My Projects */}
            {isAuthenticated && (
              <Link
                to={ROUTES.PROJECTS}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                My Projects
              </Link>
            )}

            <a href="#pricing" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
              Pricing
            </a>
          </nav>

          {/* 操作按钮 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 border border-white/10" />
            ) : (
              <Link to={ROUTES.EDITOR} className="btn-primary text-sm py-2 px-4 rounded-full shadow-lg shadow-primary-600/25">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            style={{ y: heroY, opacity }}
          >
            {/* 标签 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 mb-8 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-sm font-medium text-primary-300 tracking-wide">v2.0 Now Available</span>
            </motion.div>

            {/* 标题 */}
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                Cinematic Maps.
              </span>
              <span className="block text-glow pb-4">
                In Motion.
              </span>
            </h1>

            {/* 副标题 */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl leading-relaxed">
              Turn static locations into broadcast-quality <strong>3D map animations</strong>. 
              The ultimate <strong>GeoLayers alternative</strong> for the web. No After Effects required.
            </p>

            {/* CTA 按钮 */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to={ROUTES.EDITOR} 
                className="btn-primary h-14 px-8 text-lg rounded-full w-full sm:w-auto group"
                aria-label="Start creating a new map animation project"
              >
                <Play className="h-5 w-5 mr-2 fill-current" aria-hidden="true" />
                Start Creating
                <ArrowRight className="h-5 w-5 ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" aria-hidden="true" />
              </Link>
              <Link 
                to={ROUTES.TEMPLATES} 
                className="btn-secondary h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-slate-900/50 border-white/10 hover:bg-white/5"
                aria-label="Browse animation templates"
              >
                Explore Templates
              </Link>
            </div>
          </motion.div>

          {/* 预览图容器 */}
          <motion.div 
            className="mt-24 relative perspective-1000"
            initial={{ opacity: 0, rotateX: 20, y: 100 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
          >
            <EditorPreview />
            <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl opacity-50 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Production Ready. <span className="text-gradient">Enterprise Scale.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to create world-class map animations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Monitor}
              title="4K Video Export"
              description="Crystal clear 4K/60fps video export. Compatible with Adobe Premiere, Final Cut Pro, and DaVinci Resolve."
              delay={0}
            />
            <FeatureCard
              icon={Route}
              title="Smart Route Animation"
              description="Auto-generate smooth travel paths between any cities. Perfect for travel vlogs and road trip videos."
              delay={0.1}
            />
            <FeatureCard
              icon={Layers}
              title="3D Terrain & Buildings"
              description="Real-world elevation data and 3D building extrusion. Create immersive flyover map sequences."
              delay={0.2}
            />
            <FeatureCard
              icon={Globe}
              title="Global Satellite Maps"
              description="Access to high-resolution global satellite imagery, street maps, and dark mode themes."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-slate-900/40 border-y border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start free, then scale your map animation workflow when you are ready.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              title="Starter"
              price="$0"
              period="/month"
              description="For individuals exploring cinematic map animations."
              features={[
                'Up to 3 projects',
                '1080p export',
                'Community support',
                'Basic templates',
              ]}
              buttonText="Start for Free"
              highlighted={false}
            />
            <PricingCard
              title="Pro"
              price="$19"
              period="/month"
              description="For creators and teams publishing regularly."
              features={[
                'Unlimited projects',
                '4K/60fps export',
                'No watermark',
                'Advanced templates',
                'Priority rendering queue',
              ]}
              buttonText="Upgrade to Pro"
              highlighted={true}
            />
            <PricingCard
              title="Team"
              price="$49"
              period="/month"
              description="For studios and brands with collaboration needs."
              features={[
                'Up to 10 seats',
                'Shared asset library',
                'Team workspaces',
                'Single sign-on (SSO)',
                'Dedicated account support',
              ]}
              buttonText="Contact Sales"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* 使用步骤 - 极简流程 */}
      <section className="py-32 bg-slate-900/30 border-y border-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Workflow simplified.
                <br />
                <span className="text-slate-500">From concept to export in minutes.</span>
              </h2>
              
              <div className="space-y-8">
                <StepItem 
                  number="01"
                  title="Select & Frame"
                  description="Choose from 12+ cinematic map styles and frame your starting view."
                />
                <StepItem 
                  number="02"
                  title="Animate & Style"
                  description="Add keyframes, adjust camera angles, and style your route lines."
                />
                <StepItem 
                  number="03"
                  title="Render & Share"
                  description="Cloud rendering delivers your video file ready for broadcast."
                />
              </div>
            </motion.div>

            <motion.div
              className="relative h-[500px] rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {/* 抽象演示动画 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-primary-500/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute inset-4 rounded-full border-2 border-accent-500/30"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="h-16 w-16 text-white/20" />
                  </div>
                  {/* 轨道点 */}
                  <motion.div 
                    className="absolute top-0 left-1/2 w-3 h-3 bg-primary-500 rounded-full shadow-glow"
                    animate={{ offsetDistance: "100%" }}
                  />
                </div>
              </div>
              
              {/* 玻璃覆盖层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Render Complete</p>
                    <p className="text-xs text-slate-400">map_animation_final.mp4 (45MB)</p>
                  </div>
                  <button className="ml-auto btn-icon hover:bg-white/10">
                    <Download className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 模板展示 */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl font-bold text-white">Start from a Template</h2>
              <p className="mt-2 text-slate-400">Professional presets for every use case.</p>
            </div>
            <Link to={ROUTES.TEMPLATES} className="hidden md:flex btn-outline gap-2 border-white/20 text-slate-300 hover:text-white">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.slice(0, 6).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => window.location.href = `${ROUTES.EDITOR}?template=${template.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - SEO Goldmine for Long-Tail Keywords */}
      <section className="py-24 bg-slate-900/20 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about creating animated maps.</p>
          </div>
          
          <div className="space-y-4">
            <FaqItem 
              question="Is this a good GeoLayers alternative for web?" 
              answer="Yes, MapMotion is the premier browser-based alternative to GeoLayers. It allows you to create professional 3D map animations directly in your web browser without needing After Effects or expensive plugins." 
            />
            <FaqItem 
              question="Can I import GPX files for travel route animations?" 
              answer="Absolutely. You can upload GPX, KML, and GeoJSON files to instantly visualize your hiking, cycling, or road trip routes on a 3D map." 
            />
            <FaqItem 
              question="Is it suitable for travel vlogs and YouTube videos?" 
              answer="MapMotion is designed specifically for content creators. With 4K export and cinematic camera controls, it's perfect for travel vlogs, documentaries, and news explainers." 
            />
            <FaqItem 
              question="Do I need 3D experience to use this map animator?" 
              answer="No 3D experience is required. Our intuitive interface handles the complex terrain and camera movements for you, making it easy to create broadcast-quality map visualizations in minutes." 
            />
            <FaqItem 
              question="Can I try the map maker for free?" 
              answer="Yes, you can start creating map animations for free with our Starter plan. It includes access to basic map styles and 1080p export capabilities." 
            />
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-900/10" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to tell your story?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of creators using MapMotion to elevate their content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to={ROUTES.EDITOR}
                className="btn-primary h-12 px-8 text-base rounded-full w-full sm:w-auto shadow-glow-accent"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start for Free
              </Link>
              <Link 
                to={ROUTES.TEMPLATES}
                className="btn-secondary h-12 px-8 text-base rounded-full w-full sm:w-auto"
              >
                Explore Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">M</span>
                </div>
                <span className="text-xl font-bold text-white">MapMotion</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6">
                The professional standard for web-based map animation and data storytelling. 
                Create cinematic travel maps, route animations, and data visualizations directly in your browser.
              </p>
              {/* SEO Keywords Cloud */}
              <div className="flex flex-wrap gap-2">
                {['Map Animation', 'Travel Vlog', 'Route Builder', '3D Maps', 'Video Export'].map(tag => (
                  <span key={tag} className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded-md border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Showcase</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2024 MapMotion Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** 功能卡片 */
function FeatureCard({ icon: Icon, title, description, delay }: { icon: LucideIcon; title: string; description: string; delay: number }) {
  return (
    <motion.div 
      className="card p-6 group hover:-translate-y-2"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
    >
      <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 group-hover:border-primary-500/50 transition-colors">
        <Icon className="h-6 w-6 text-slate-300 group-hover:text-primary-400 transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-glow transition-all">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/** 步骤项 */
function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="text-3xl font-bold text-slate-700 group-hover:text-primary-500 transition-colors font-mono">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  );
}

/** FAQ Item Component */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        {isOpen ? <Minus className="h-5 w-5 text-primary-500" /> : <Plus className="h-5 w-5 text-slate-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Pricing Card Component */
function PricingCard({ 
  title, 
  price, 
  period = "", 
  description, 
  features, 
  buttonText, 
  highlighted 
}: { 
  title: string, 
  price: string, 
  period?: string, 
  description: string, 
  features: string[], 
  buttonText: string,
  highlighted: boolean
}) {
  return (
    <div className={`relative p-8 rounded-3xl flex flex-col ${
      highlighted 
        ? 'bg-slate-900 border-2 border-primary-500 shadow-2xl shadow-primary-900/20' 
        : 'bg-white/5 border border-white/5'
    }`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wide shadow-lg">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-slate-500">{period}</span>
        </div>
        <p className="mt-4 text-slate-400 text-sm">{description}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <Check className={`h-5 w-5 shrink-0 ${highlighted ? 'text-primary-400' : 'text-slate-500'}`} />
            {feature}
          </li>
        ))}
      </ul>

      <button className={`w-full py-3 rounded-xl font-bold transition-all ${
        highlighted 
          ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20' 
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}>
        {buttonText}
      </button>
    </div>
  );
}
