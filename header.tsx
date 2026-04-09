"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Search, ChevronDown, ChevronRight, ArrowRight, LayoutDashboard, ShoppingBag, Heart, ShoppingCart, LayoutGrid, Home, Laptop, Baby, BookOpen, Package, LucideIcon } from "lucide-react"
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { addSearchQuery } from "@/lib/search-history"
import { useCart } from "@/contexts/cart-context"
import { getCategoryTreeAction, listProductsAction } from "@/lib/actions"
import type { CategoryNode } from "@befach/shared"

// Category icon mapping
const categoryIcons: Record<string, LucideIcon> = {
  "Household Appliances": Home,
  "Home & Garden": Home,
  "Household Supplies": ShoppingBag,
  "Janimaz-adult": BookOpen,
  "Janimaz-kids": Baby,
  "Religious & Ceremonial": BookOpen,
  "Religious Items": BookOpen,
  "Electronics": Laptop,
}

function getIconForCategory(category: string): LucideIcon {
  if (categoryIcons[category]) return categoryIcons[category]!
  for (const key of Object.keys(categoryIcons)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return categoryIcons[key]!
    }
  }
  return Package
}

interface CategoryProduct {
  name: string
  slug: string
  image: string
  category: string
}

interface Suggestion {
  id: string
  name: string
  slug: string
  category?: string
  imageUrl?: string
}

const navLinks = [
  { label: "All Products", href: "/products" },
  { label: "Import Services", href: "/import-services" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blogs" },
  { label: "Track Your Shipment", href: "https://track.befach.com/track-new", external: true },
]

// When scrolled: Import Services + Track Your Shipment stay visible
const persistentLabels = new Set(["Import Services", "Track Your Shipment"])
// When scrolled: All Products, About Us, Blog collapse
const collapsibleLabels = new Set(["All Products", "About Us", "Blog"])
const persistentLinks = navLinks.filter((l) => persistentLabels.has(l.label))
const collapsibleLinks = navLinks.filter((l) => collapsibleLabels.has(l.label))

/** Debounced search suggestions with abort support and outside-click dismissal */
function useSearchSuggestions(searchQuery: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestTimerRef = useRef<NodeJS.Timeout | null>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
    if (searchQuery.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); setActiveIndex(-1); return }
    const controller = new AbortController()
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery.trim())}`, { signal: controller.signal })
        if (!res.ok) { setSuggestions([]); setShowSuggestions(false); return }
        const data = await res.json()
        const items = Array.isArray(data) ? data : []
        setSuggestions(items)
        setShowSuggestions(items.length > 0)
        setActiveIndex(-1)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setSuggestions([]); setShowSuggestions(false)
      }
    }, 200)
    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
      controller.abort()
    }
  }, [searchQuery])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return { suggestions, showSuggestions, setShowSuggestions, activeIndex, setActiveIndex, searchWrapperRef }
}

const linkClass = "text-espresso hover:text-primary"

/** Module-scoped to prevent remount on re-render */
const NavLink = ({ link }: { link: typeof navLinks[0] }) => (
  'external' in link && link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${linkClass}`}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={`px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${linkClass}`}>
      {link.label}
    </Link>
  )
)

/** Show Login/Sign Up only when auth is loaded and user is NOT signed in (prevents flash) */
function AuthButtons() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded || isSignedIn) return null
  return (
    <>
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-full border border-gray-300 text-espresso hover:border-primary hover:text-primary transition-colors"
      >
        Login
      </Link>
      <Link
        href="/sign-up"
        className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        Sign Up
      </Link>
    </>
  )
}

function MobileAuthButtons({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded || isSignedIn) return null
  return (
    <>
      <Link href="/sign-in" className="block py-3 text-white" onClick={onNavigate}>
        Login
      </Link>
      <Link href="/sign-up" className="block py-3 px-4 bg-primary text-white rounded-lg text-center font-medium" onClick={onNavigate}>
        Sign Up
      </Link>
    </>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [categoryProducts, setCategoryProducts] = useState<Record<string, CategoryProduct[]>>({})
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryButtonRef = useRef<HTMLButtonElement>(null)
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedCategories = useRef(false)
  const headerRef = useRef<HTMLElement>(null)
  const savedScrollY = useRef(0)
  const [headerHeight, setHeaderHeight] = useState(64)
  const router = useRouter()
  const { itemCount, openDrawer } = useCart()
  const { suggestions, showSuggestions, setShowSuggestions, activeIndex, setActiveIndex, searchWrapperRef } = useSearchSuggestions(searchQuery)

  const selectSuggestion = (s: Suggestion) => {
    setSearchQuery(s.name)
    setShowSuggestions(false)
    addSearchQuery(s.name)
    router.push(`/products/${s.slug}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      const s = suggestions[activeIndex]
      if (s) selectSuggestion(s)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  // Scroll detection — also show search on short pages that can't scroll past 50px
  useEffect(() => {
    const check = () => {
      const canScroll = document.documentElement.scrollHeight - window.innerHeight > 50
      setIsScrolled(canScroll ? window.scrollY > 50 : true)
    }
    check()
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check, { passive: true })
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [])

  // Measure header height dynamically via ResizeObserver
  useEffect(() => {
    if (!headerRef.current) return
    const update = () => { if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight) }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  // Reset mobile category expansion whenever the menu closes
  useEffect(() => {
    if (!isMenuOpen) setMobileCategoryOpen(false)
  }, [isMenuOpen])

  // Lock body scroll when mobile menu is open (iOS Safari compatible)
  useEffect(() => {
    if (!isMenuOpen) return
    savedScrollY.current = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY.current}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, savedScrollY.current)
    }
  }, [isMenuOpen])

  // Lazy-load categories + products — only fires once, on first dropdown open
  async function fetchCategoryData() {
    if (hasFetchedCategories.current) return
    hasFetchedCategories.current = true
    try {
      const [treeResult, productsResult] = await Promise.all([
        getCategoryTreeAction(),
        listProductsAction({ status: 'published', perPage: 60, sortBy: 'newest' }),
      ])

      if (treeResult.success) {
        const flatCats = treeResult.data.map((node: CategoryNode) => node.name).sort()
        setCategories(flatCats)
        if (flatCats.length > 0) setHoveredCategory(flatCats[0] ?? null)

        if (productsResult.success) {
          const grouped: Record<string, CategoryProduct[]> = {}
          for (const p of productsResult.data.items) {
            const catName = p.categories?.[0]?.name ?? null
            if (!catName) continue
            if (!grouped[catName]) grouped[catName] = []
            if (grouped[catName].length < 12) {
              grouped[catName].push({
                name: p.name,
                slug: p.slug,
                image: p.mainImage ?? '/placeholder.svg',
                category: catName,
              })
            }
          }
          setCategoryProducts(grouped)
        }
      }
    } catch {
      // Silently fail — reset flag so next hover retries
      hasFetchedCategories.current = false
    }
  }

  const handleCategoryEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current)
    fetchCategoryData()
    setIsCategoryOpen(true)
  }

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => setIsCategoryOpen(false), 150)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    addSearchQuery(searchQuery)
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setIsMenuOpen(false)
  }

  // Collapsible nav links: All Products / About Us / Blog shrink away on scroll
  const collapsingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    maxWidth: isScrolled ? "0px" : "600px",
    opacity: isScrolled ? 0 : 1,
    overflow: "hidden",
    flexShrink: 0,
    transition: "max-width 0.25s cubic-bezier(0.2,0,0,1), opacity 0.15s ease",
  }

  // Search bar: grows in from center after scroll
  const searchStyle: React.CSSProperties = {
    maxWidth: isScrolled ? "480px" : "0px",
    flex: isScrolled ? "1 1 480px" : "0 0 0px",
    minWidth: isScrolled ? "280px" : "0px",
    opacity: isScrolled ? 1 : 0,
    overflow: "hidden",
    transition: "max-width 0.25s cubic-bezier(0.2,0,0,1), flex 0.25s cubic-bezier(0.2,0,0,1), min-width 0.25s cubic-bezier(0.2,0,0,1), opacity 0.15s ease",
  }

  // Full-width dropdown: slides down from header bottom
  const dropdownStyle: React.CSSProperties = {
    position: "fixed",
    top: headerHeight,
    left: 0,
    right: 0,
    opacity: isCategoryOpen ? 1 : 0,
    transform: isCategoryOpen ? "translateY(0)" : "translateY(-8px)",
    pointerEvents: isCategoryOpen ? "auto" : "none",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    zIndex: 50,
  }

  return (
    <header
      ref={headerRef}
      className="w-full sticky top-0 z-50 bg-white transition-shadow duration-300"
      style={{
        borderBottom: "1px solid #f0ede8",
        boxShadow: isScrolled ? "0 2px 16px rgba(0,0,0,0.07)" : "none",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-16 gap-1.5">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-6">
            <div className="overflow-hidden w-9 lg:w-auto">
              <Image src="/logo.png" alt="BEFACH" width={120} height={48} className="h-10 w-auto" priority />
            </div>
          </Link>

          {/* Search bar — appears on scroll, positioned after logo */}
          <div
            ref={searchWrapperRef}
            className="hidden lg:block relative"
            style={searchStyle}
            aria-hidden={!isScrolled || undefined}
            {...(!isScrolled ? { inert: true } : {})}
          >
            <form onSubmit={(e) => { setShowSuggestions(false); handleSearch(e) }} className="w-full">
              <div className="flex items-center bg-white rounded-full h-[42px] border-2 border-primary overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(242,146,34,0.10)" }}>
                <Search className="ml-3.5 shrink-0 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchQuery(val)
                    setActiveIndex(-1)
                    if (val.trim().length >= 2) { setShowSuggestions(true) } else { setShowSuggestions(false) }
                  }}
                  onFocus={() => searchQuery.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search for product..."
                  role="combobox"
                  aria-label="Search for products and suppliers"
                  aria-autocomplete="list"
                  aria-expanded={isScrolled && showSuggestions && suggestions.length > 0}
                  aria-controls="search-suggestions-listbox"
                  aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
                  autoComplete="off"
                  tabIndex={isScrolled ? 0 : -1}
                  className="flex-1 border-none outline-none px-2.5 text-sm bg-transparent h-full"
                />
              </div>
            </form>
            {/* Autocomplete dropdown */}
            {isScrolled && showSuggestions && suggestions.length > 0 && (
              <div id="search-suggestions-listbox" className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden" role="listbox">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    id={`suggestion-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${i === activeIndex ? 'bg-muted' : 'hover:bg-muted'}`}
                  >
                    {s.imageUrl && (
                      <Image src={s.imageUrl} alt="" width={32} height={32} className="rounded object-cover shrink-0" unoptimized />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      {s.category && <p className="text-xs text-muted-foreground truncate">{s.category}</p>}
                    </div>
                    <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Categories Button — always visible */}
          <nav
            aria-label="Product categories"
            className="hidden lg:block relative shrink-0"
            onMouseEnter={handleCategoryEnter}
            onMouseLeave={handleCategoryLeave}
          >
            <button
              ref={categoryButtonRef}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${linkClass}`}
              aria-expanded={isCategoryOpen}
              aria-haspopup="true"
              aria-controls="category-dropdown-panel"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && isCategoryOpen) {
                  setIsCategoryOpen(false)
                  categoryButtonRef.current?.focus()
                }
              }}
            >
              <LayoutGrid className="w-4 h-4" />
              All Categories
              <ChevronDown className={`w-3 h-3 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
          </nav>

          {/* Nav links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center min-w-0">
            {/* Collapsible: All Products, About Us, Blog — collapse on scroll */}
            <div
              style={collapsingStyle}
              aria-hidden={isScrolled || undefined}
              {...(isScrolled ? { inert: true } : {})}
            >
              {collapsibleLinks.map((link) => <NavLink key={link.label} link={link} />)}
            </div>
            {/* Persistent: Import Services, Track Your Shipment — always visible */}
            {persistentLinks.map((link) => <NavLink key={link.label} link={link} />)}
          </nav>

          {/* Spacer */}
          <div className="hidden lg:block flex-1 min-w-0" />

          {/* Right Side: Cart + Auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 relative z-10">
            <button onClick={openDrawer} className="relative p-2 text-espresso hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Login / User Account */}
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 font-medium rounded-full px-5">
                  Login
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                    userButtonPopoverCard: 'shadow-lg border border-cream',
                    userButtonPopoverActionButton: 'hover:bg-cloud-gray',
                  }
                }}
                afterSignOutUrl="/"
              >
                <UserButton.MenuItems>
                  <UserButton.Link label="Dashboard" labelIcon={<LayoutDashboard className="w-4 h-4" />} href="/dashboard" />
                  <UserButton.Link label="Orders" labelIcon={<ShoppingBag className="w-4 h-4" />} href="/dashboard/orders" />
                  <UserButton.Link label="Wishlist" labelIcon={<Heart className="w-4 h-4" />} href="/wishlist" />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden ml-auto">
            <button
              className="p-2 text-espresso min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width category mega dropdown */}
      <nav
        id="category-dropdown-panel"
        aria-label="Category products"
        aria-hidden={!isCategoryOpen}
        {...(!isCategoryOpen ? { inert: true } : {})}
        style={dropdownStyle}
        onMouseEnter={handleCategoryEnter}
        onMouseLeave={handleCategoryLeave}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsCategoryOpen(false)
            categoryButtonRef.current?.focus()
          }
        }}
      >
        <div className="bg-white border-t border-gray-100" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
          <div className="flex w-full">
            {/* Left: category sidebar */}
            <div className="w-[260px] border-r border-gray-100 py-3 shrink-0 max-h-[520px] overflow-y-auto bg-gray-50/60">
              {categories.map((cat) => {
                const Icon = getIconForCategory(cat)
                const active = hoveredCategory === cat
                return (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150"
                    style={{
                      background: active ? "rgba(242,146,34,0.08)" : "transparent",
                      borderLeft: active ? "3px solid #f29222" : "3px solid transparent",
                      color: active ? "#f29222" : "#3d2510",
                      fontWeight: 600,
                    }}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onFocus={() => setHoveredCategory(cat)}
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: active ? "#f29222" : "#888" }} />
                    <span className="flex-1 truncate">{cat}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                  </Link>
                )
              })}
              <div className="border-t border-gray-100 mt-2 pt-2 px-5">
                <Link href="/products" className="flex items-center gap-1.5 py-2 text-sm font-semibold text-primary hover:gap-2.5 transition-all" onClick={() => setIsCategoryOpen(false)}>
                  View All Products <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: products grid */}
            <div className="flex-1 p-8 max-h-[520px] overflow-y-auto">
              {hoveredCategory && (
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-base font-bold text-espresso">{hoveredCategory}</h4>
                  <Link href={`/products?category=${encodeURIComponent(hoveredCategory)}`} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1" onClick={() => setIsCategoryOpen(false)}>
                    Browse all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {hoveredCategory && (categoryProducts[hoveredCategory]?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-6 xl:grid-cols-8 gap-4">
                  {categoryProducts[hoveredCategory]!.map((product) => (
                    <Link key={product.slug} href={`/products/${product.slug}`} className="flex flex-col items-center text-center group" onClick={() => setIsCategoryOpen(false)}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100 mb-2 group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200">
                        <Image src={product.image || '/placeholder.svg'} alt={product.name} width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-gray-600 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{product.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {hoveredCategory ? `Browse ${hoveredCategory} products` : "Hover a category to explore"}
                  </p>
                  {hoveredCategory && (
                    <Link href={`/products?category=${encodeURIComponent(hoveredCategory)}`} className="text-sm font-semibold text-primary hover:underline" onClick={() => setIsCategoryOpen(false)}>
                      View all products →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — full-screen overlay below header */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-espresso z-40 overflow-y-auto overscroll-contain" style={{ top: `${headerHeight}px` }}>
          <nav className="flex flex-col p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-titanium-gray" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="Search products and suppliers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 bg-white rounded-lg w-full"
                  aria-label="Search for products"
                />
              </div>
            </form>

            {/* Mobile All Categories */}
            {categories.length > 0 && (
              <div className="border-b border-white/10">
                <button
                  className="flex items-center justify-between w-full py-3 text-white"
                  onClick={() => { fetchCategoryData(); setMobileCategoryOpen(!mobileCategoryOpen) }}
                  aria-expanded={mobileCategoryOpen}
                  aria-controls="mobile-category-list"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    All Categories
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                <div id="mobile-category-list" className="pb-3 pl-6 space-y-1" hidden={!mobileCategoryOpen}>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              'external' in link && link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-white border-b border-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-3 text-white border-b border-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <Link
                href="/cart"
                className="flex items-center gap-2 py-3 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
              <MobileAuthButtons onNavigate={() => setIsMenuOpen(false)} />
              <SignedIn>
                <div className="flex items-center gap-3 py-3">
                  <UserButton
                    appearance={{ elements: { avatarBox: 'w-9 h-9' } }}
                    afterSignOutUrl="/"
                  >
                    <UserButton.MenuItems>
                      <UserButton.Link label="Dashboard" labelIcon={<LayoutDashboard className="w-4 h-4" />} href="/dashboard" />
                      <UserButton.Link label="Orders" labelIcon={<ShoppingBag className="w-4 h-4" />} href="/dashboard/orders" />
                      <UserButton.Link label="Wishlist" labelIcon={<Heart className="w-4 h-4" />} href="/wishlist" />
                    </UserButton.MenuItems>
                  </UserButton>
                  <span className="text-white text-sm">My Account</span>
                </div>
                <Link
                  href="/dashboard"
                  className="block py-3 px-4 bg-accent text-espresso rounded-lg text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
