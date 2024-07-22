"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button/button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card/card';
import Link from 'next/link';
import { APPNAME } from '@/config';

export default function Home() {
  const { sessionId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (sessionId && !isLoading) {
        router.push('/dashboard')
      }
    };
  }, [sessionId, isLoading, router])

  return (
    <div className="flex flex-col min-h-screen">
    <header className="flex justify-between items-center p-4 bg-white">
      <div className="text-2xl font-bold">ProctorXpert</div>
      <nav>
        <ul className="flex space-x-4">
          <li><Link href="#features">Features</Link></li>
          <li><Link href="#pricing">Pricing</Link></li>
          {/* <li><Link href="#about">About Us</Link></li> */}
          {/* <li><Link href="/contact">Contact</Link></li> */}
        </ul>
      </nav>
      <div className="space-x-2">
        <Button variant="outline" onClick={() => router.push('/auth/login')}>Sign In</Button>
        <Button onClick={() => router.push('/register')}>Sign Up</Button>
      </div>
    </header>

    <main className="flex-grow">
      <section className="bg-blue-100 py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{`Welcome to ${APPNAME}. Revolutionizing remote testing.`}</h1>
          <p className="text-xl mb-8">Ensure exam integrity with our AI-driven proctoring platform.</p>
          <Button size="lg" onClick={() => router.push('/register')}>Get Started</Button>
        </div>
      </section>

      <section className="py-16 px-4" id="features">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['AI-Powered Proctoring', 'Customizable Rulesets', 'LMS Integration'].map((feature, index) => (
              <Card key={index}>
                <CardHeader className="text-xl font-semibold">{feature}</CardHeader>
                <CardContent>Description of {feature}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-4" id="">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our clients love us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((testimonial) => (
              <Card key={testimonial}>
                <CardContent>
                  <p className="mb-4">&quot;Testimonial text here...&quot;</p>
                  <p className="font-semibold">- Client Name, Institution</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Key Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              'Millions of concurrent users supported',
              '24/7 Support',
              '99.9% Uptime'
            ].map((stat, index) => (
              <div key={index} className="text-2xl font-bold">{stat}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4" id="pricing">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Basic', 'Pro', 'Enterprise'].map((tier, index) => (
              <Card key={index}>
                <CardHeader>
                  <h3 className="text-2xl font-bold">{tier}</h3>
                  <p className="text-xl">$XX/month</p>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    <li>Feature 1</li>
                    <li>Feature 2</li>
                    <li>Feature 3</li>
                  </ul>
                  <Button className="mt-4 w-full">Choose Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-500 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Experience the future of online proctoring</h2>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-500">
            Request a Demo
          </Button>
        </div>
      </section>
    </main>

    <footer className="bg-gray-100 py-8 px-4">
      <div className="container mx-auto flex flex-wrap justify-between">
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">{APPNAME}</h3>
          <p>Advanced AI-driven online proctoring</p>
        </div>
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul>
            <li><Link href="#features">Features</Link></li>
            <li><Link href="#pricing">Pricing</Link></li>
            {/* <li><Link href="#about">About Us</Link></li> */}
            {/* <li><Link href="#contact">Contact</Link></li> */}
          </ul>
        </div>
        <div className="w-full md:w-1/4 mb-4 md:mb-0" id="contact">
          <h4 className="font-semibold mb-2">Follow Us</h4>
          {/* Add social media icons here */}
        </div>
      </div>
      <div className="text-center mt-8">
        {`© ${new Date().getFullYear()} ${APPNAME}. All rights reserved.`}
      </div>
    </footer>
  </div>
  );
}
