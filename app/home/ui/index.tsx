import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-6">
      <div className="text-2xl font-bold">Prepnepal</div>
      <div className="space-x-6">
        <Link href="/" className="hover:text-blue-600">Test</Link>
        <Link href="/" className="hover:text-blue-600">Courses</Link>
      </div>
      <div className="space-x-4">
        <Link href="/" className="hover:text-blue-600">Login</Link>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</Link>
      </div>
    </nav>
  )
}

const Hero = () => {
    return (
      <section className="bg-blue-100 py-20">
        <div className="container mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center">Welcome to Prepnepal. Prepare with confidence.</h1>
          <p className="mt-4 text-xl text-center">Excel every exam with our high yield MCQ&apos;s.</p>
          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">Live Examples</button>
        </div>
      </section>
    )
  }

  const Features = () => {
    return (
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold">What we offer</h2>
          <div className="mt-10 flex justify-around">
            <div>
              <svg className="mx-auto h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <h3 className="mt-4 text-xl font-semibold">Live Tests</h3>
              <p className="mt-2">Register for the Exam you want to Appear. You can Register in single click from the Exam of your Interest Dashboard.</p>
            </div>
            <div>
              <svg className="mx-auto h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.866 0-7 2.239-7 5s3.134 5 7 5 7-2.239 7-5-3.134-5-7-5zM12 6V4m-2 2h4"></path></svg>
              <h3 className="mt-4 text-xl font-semibold">High Yield Questions</h3>
              <p className="mt-2">Take Live test on Time. You can take the missed test from Missed Test Area. New tests and topics are there in line.</p>
            </div>
            <div>
              <svg className="mx-auto h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1M12 9h.01M21 12.25c0 5.5-4.5 9.75-9.5 9.75S2 17.75 2 12.25 6.5 2.5 11.5 2.5 21 6.75 21 12.25z"></path></svg>
              <h3 className="mt-4 text-xl font-semibold">Insightful Analytics</h3>
              <p className="mt-2">Dashboard is the main screen that helps you analyze your performance. Everything is placed in a single preparation pool.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const Testimonials = () => {
    return (
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold">Our students are our biggest fans.</h2>
          <div className="mt-10 flex justify-around">
            <div className="bg-white p-6 rounded shadow-md">
              <p className="italic">&quot;This was an amazing course! I can&apos;t say enough good things about this course. Angela is an amazing instructor and did an extremely great job teaching all that was promised in the course description.&quot;</p>
              <p className="mt-4 font-semibold">Matt Haris</p>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <p className="italic">&qout;This was an amazing course! I can&apos;t say enough good things about this course. Angela is an amazing instructor and did an extremely great job teaching all that was promised in the course description.&qout;</p>
              <p className="mt-4 font-semibold">Natalia Jonas</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const Pricing = () => {
    return (
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold">Fair & simple pricing for all</h2>
          <div className="mt-10 flex justify-around">
            <div className="bg-white p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold">Physiology Test</h3>
              <p className="mt-2">Loksewa</p>
              <p className="mt-4 text-2xl font-bold">Rs. 100</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Buy Now</button>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold">Pathology Test</h3>
              <p className="mt-2">NMCLIE</p>
              <p className="mt-4 text-2xl font-bold">Rs. 100</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Buy Now</button>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold">Cardiology Test</h3>
              <p className="mt-2">MD/MS</p>
              <p className="mt-4 text-2xl font-bold">Rs. 100</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Buy Now</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const Footer = () => {
    return (
      <footer className="bg-blue-100 py-10">
        <div className="container mx-auto text-center">
          <div className="flex justify-around mb-6">
            <div>
              <h4 className="font-bold">Prepnepal</h4>
            </div>
            <div>
              <h4 className="font-bold">Services</h4>
              <ul>
                <li>Test</li>
                <li>Courses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold">Company</h4>
              <ul>
                <li>About Us</li>
                <li>Support</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold">Social</h4>
              <ul>
                <li>Blog</li>
                <li>Facebook</li>
                <li>Twitter</li>
              </ul>
            </div>
          </div>
          <p>Prepnepal Ltd. © 2020, All rights reserved.</p>
        </div>
      </footer>
    )
  }
  
export { Navbar, Hero, Pricing, Features, Testimonials, Footer };
