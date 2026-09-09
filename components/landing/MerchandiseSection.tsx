'use client'

import {useState, useRef, useEffect, useCallback} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import EnlargeIcon from '@/app/assets/Enlarge.svg'
import XIcon from '@/app/assets/X.svg'
import CaretLeftIcon from '@/app/assets/CaretLeft.svg'
import CaretRightIcon from '@/app/assets/CaretRight.svg'
import ToteBagProduct from '@/app/assets/Merchandise/Products/Tote Bag.png'
import TShirt1Product from '@/app/assets/Merchandise/Products/T Shirt.png'
import TShirt2Product from '@/app/assets/Merchandise/Products/T Shirt 2.png'
import ToteBagScene from '@/app/assets/Merchandise/Tote Bag Scene.png'
import ToteBagScene2 from '@/app/assets/Merchandise/Tote Bag Scene 2.png'
import TShirtScene from '@/app/assets/Merchandise/T Shirt Scene.png'
import TShirtScene2 from '@/app/assets/Merchandise/T Shirt Scene 2.png'
import TShirtScene3 from '@/app/assets/Merchandise/T Shirt Scene 3.png'
import TShirtScene4 from '@/app/assets/Merchandise/T Shirt Scene 4.png'
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type ProductSize = 'L' | 'XL' | 'XXL'
type TShirtDesign = 1 | 2

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  productName: string
}

const QuickViewModal = ({isOpen, onClose, images, productName}: QuickViewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isOpening = useRef(false)

  useEffect(() => {
    if (isOpen && overlayRef.current && panelRef.current) {
      isOpening.current = true
      setCurrentIndex(0)
      const ctx = gsap.context(() => {
        gsap.fromTo(overlayRef.current, {opacity: 0}, {opacity: 1, duration: 0.35, ease: 'power2.out'})
        gsap.fromTo(
          panelRef.current,
          {opacity: 0, scale: 0.92, y: 30},
          {opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)', delay: 0.08, onComplete: () => { isOpening.current = false }}
        )
      })
      return () => ctx.revert()
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    if (!overlayRef.current || !panelRef.current || isOpening.current) return
    isOpening.current = false
    const ctx = gsap.context(() => {
      gsap.to(panelRef.current, {opacity: 0, scale: 0.95, y: 20, duration: 0.25, ease: 'power2.in'})
      gsap.to(overlayRef.current, {opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onClose})
    })
    return () => ctx.revert()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) isOpening.current = false
  }, [isOpen])

  if (!isOpen) return null

  const handleNext = () => {
    if (!panelRef.current) return
    gsap.fromTo(panelRef.current.querySelector('[data-carousel-img]'),
      {opacity: 0, x: 30},
      {opacity: 1, x: 0, duration: 0.35, ease: 'power2.out'}
    )
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    if (!panelRef.current) return
    gsap.fromTo(panelRef.current.querySelector('[data-carousel-img]'),
      {opacity: 0, x: -30},
      {opacity: 1, x: 0, duration: 0.35, ease: 'power2.out'}
    )
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="relative bg-white rounded-2xl max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:rotate-90 transition-all duration-500 ease-out hover:scale-110 active:scale-95"
        >
          <Image src={XIcon} alt="Close" width={16} height={16}/>
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="text-xl font-bold text-ocean-primary">QUICK VIEW</h2>
        </div>

        {/* Image Carousel */}
        <div className="relative p-5">
          <div className="relative aspect-3/4 w-full bg-ocean-medium rounded-lg overflow-hidden">
            <Image
              key={currentIndex}
              data-carousel-img
              src={images[currentIndex]}
              alt={`${productName} - View ${currentIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-7 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,10)] rounded-full hover:shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,5)] hover:scale-110 hover:-translate-x-1 active:scale-95 transition-all duration-500 ease-out flex items-center justify-center"
              >
                <Image src={CaretLeftIcon} alt="Previous" width={20} height={20}/>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-7 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,10)] rounded-full hover:shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,5)] hover:scale-110 hover:translate-x-1 active:scale-95 transition-all duration-500 ease-out flex items-center justify-center"
              >
                <Image src={CaretRightIcon} alt="Next" width={20} height={20}/>
              </button>
            </>
          )}

          {/* Indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-500 ease-out hover:scale-110 ${
                    index === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const MerchandiseSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const toteCardRef = useRef<HTMLDivElement>(null)
  const tshirtCardRef = useRef<HTMLDivElement>(null)

  // Tote Bag State
  const [showToteBagModal, setShowToteBagModal] = useState(false)

  // T-Shirt State
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L')
  const [selectedDesign, setSelectedDesign] = useState<TShirtDesign>(1)
  const [showTShirtModal, setShowTShirtModal] = useState(false)

  // T-Shirt pricing based on size
  const tShirtPrices: Record<ProductSize, string> = {
    L: "18,500",
    XL: "19,000",
    XXL: "20,000",
  }

  const sizes: ProductSize[] = ['L', 'XL', 'XXL']

  // Scroll-triggered intro animations
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title entrance
      gsap.fromTo(titleRef.current,
        {opacity: 0, y: 40},
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: {trigger: titleRef.current, start: 'top 85%', once: true}
        }
      )

      // Tote card entrance — slide from left
      gsap.fromTo(toteCardRef.current,
        {opacity: 0, x: -60, scale: 0.95},
        {
          opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.15,
          scrollTrigger: {trigger: toteCardRef.current, start: 'top 85%', once: true}
        }
      )

      // T-Shirt card entrance — slide from right
      gsap.fromTo(tshirtCardRef.current,
        {opacity: 0, x: 60, scale: 0.95},
        {
          opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.3,
          scrollTrigger: {trigger: tshirtCardRef.current, start: 'top 85%', once: true}
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 ref={titleRef} className="font-syne text-4xl md:text-5xl font-bold text-[#0891b2] mb-12 opacity-0">
          Preorder Items
        </h2>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tote Bag */}
          <div
            ref={toteCardRef}
            className="group relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-700 ease-out hover:scale-[1.02] opacity-0"
          >
            {/* Quick View Button - Bottom Right Corner */}
            <button
              onClick={() => setShowToteBagModal(true)}
              className="absolute bottom-6 right-6 z-10 bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,5)] rounded-full p-3 hover:shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 ease-out transform md:group-hover:scale-110 md:group-hover:rotate-12 active:scale-95"
            >
              <Image src={EnlargeIcon} alt="Enlarge" width={24} height={24}/>
            </button>

            <div className="relative z-0">
              {/* Product Info */}
              <div className="text-center mb-6">
                <h3 className="text-4xl font-bold mb-3 tracking-wider group-hover:scale-105 transition-transform duration-700 ease-out">TOTE-BAG</h3>
                <p className="font-syne text-white/90 text-sm leading-relaxed max-w-md mx-auto mb-6 group-hover:text-white transition-colors duration-700 ease-out">
                  A practical tote bag featuring the &#34;Into The AI Ocean&#34; design, a simple way to carry a piece of the event with you.
                </p>
                <div className="font-syncopate text-4xl font-bold mb-6 group-hover:scale-110 transition-transform duration-700 ease-out">14,500 MMK</div>
                <Link
                  href="https://forms.gle/78zmXhfAtLziZSNa9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-syne bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold px-10 py-3 rounded-full transition-all duration-500 ease-out transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-orange-400/50">
                  Preorder Now
                </Link>
              </div>

              {/* Product Image */}
              <div className="relative h-80 mt-8 group-hover:scale-105 transition-transform duration-700 ease-out">
                <Image
                  src={ToteBagProduct}
                  alt="Tote Bag"
                  fill
                  className="object-contain drop-shadow-2xl transition-all duration-700 ease-out"
                />
              </div>
            </div>
          </div>

          {/* T-Shirt */}
          <div
            ref={tshirtCardRef}
            className="group relative bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-700 ease-out hover:scale-[1.02] opacity-0"
          >
            {/* Quick View Button - Bottom Right Corner */}
            <button
              onClick={() => setShowTShirtModal(true)}
              className="absolute bottom-6 right-6 z-10 bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,5)] rounded-full p-3 hover:shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 ease-out transform md:group-hover:scale-110 md:group-hover:rotate-12 active:scale-95"
            >
              <Image src={EnlargeIcon} alt="Enlarge" width={24} height={24}/>
            </button>

            <div className="relative z-0">
              {/* Product Info */}
              <div className="text-center mb-6">
                <h3 className="text-4xl font-bold mb-3 tracking-wider group-hover:scale-105 transition-transform duration-700 ease-out">T-SHIRT</h3>
                <p className="font-syne text-white/90 text-sm leading-relaxed max-w-md mx-auto mb-6 group-hover:text-white transition-colors duration-700 ease-out">
                  Exclusive Into The AI Ocean T-shirt featuring our signature event artwork and branding. A special piece to wear, keep, and remember the experience.
                </p>
                <div className="font-syncopate text-4xl font-bold mb-6 group-hover:scale-110 transition-all duration-700 ease-out">
                  {tShirtPrices[selectedSize]} MMK
                </div>
                <Link
                  href="https://forms.gle/HDMhHx1CjUYyTu6g6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-syne bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold px-10 py-3 rounded-full transition-all duration-500 ease-out transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-orange-400/50">
                  Preorder Now
                </Link>
              </div>

              {/* Product Image with Size Selector */}
              <div className="relative">
                <div className="relative h-80 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    key={selectedDesign}
                    src={selectedDesign === 1 ? TShirt1Product : TShirt2Product}
                    alt="T-Shirt"
                    fill
                    className="object-contain drop-shadow-2xl transition-all duration-500 ease-out"
                  />
                </div>

                {/* Size Selector - Positioned on the right side */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <div className="text-xs font-semibold mb-1 text-center">Size</div>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-2 py-1.5 rounded-full font-syne font-bold text-sm transition-all duration-500 ease-out hover:scale-110 active:scale-95 ${
                        selectedSize === size
                          ? 'bg-white text-green-700 shadow-lg scale-110'
                          : 'bg-transparent hover:bg-white/30 text-white border border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Selector */}
              <div className="flex justify-center gap-4 pb-12 md:pb-0">
                <button
                  onClick={() => setSelectedDesign(1)}
                  className={`font-syne px-6 py-2 text-white border rounded-full hover:brightness-110 transition-all duration-500 ease-out font-bold hover:scale-105 active:scale-95 ${
                    selectedDesign === 1
                      ? 'bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,10)] scale-105'
                      : 'bg-none hover:bg-white/30 border border-white'
                  }`}
                >
                  Design 1
                </button>
                <button
                  onClick={() => setSelectedDesign(2)}
                  className={`font-syne px-6 py-2 text-white border rounded-full hover:brightness-110 transition-all duration-500 ease-out font-bold hover:scale-105 active:scale-95 ${
                    selectedDesign === 2
                      ? 'bg-white/10 border-white/30 shadow-[inset_0px_0px_10px_5px_rgba(255,255,255,10)] scale-105'
                      : 'bg-none hover:bg-white/30 border border-white'
                  }`}
                >
                  Design 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modals */}
      <QuickViewModal
        isOpen={showToteBagModal}
        onClose={() => setShowToteBagModal(false)}
        images={[ToteBagScene.src, ToteBagScene2.src, ToteBagProduct.src]}
        productName="Tote Bag"
      />
      <QuickViewModal
        isOpen={showTShirtModal}
        onClose={() => setShowTShirtModal(false)}
        images={[TShirtScene.src, TShirtScene2.src, TShirtScene3.src, TShirtScene4.src, TShirt1Product.src, TShirt2Product.src]}
        productName="T-Shirt"
      />
    </section>
  )
}
