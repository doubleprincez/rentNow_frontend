'use client'
import {Button} from '@/components/ui/button'
import axios from 'axios'
import React, {useState} from 'react'
import {subscribeToMailchimp} from "@/features/landing/api/subscriptions";

const Subscribe = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubscribe = async () => {
        setLoading(()=>true)
        setMessage(null)

        try {
            const response = await subscribeToMailchimp(email)

            if (response.status === 201) {
                setMessage('🎉 You have successfully subscribed!');
                setEmail('');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.error || 'Something went wrong.')
            } else {
                setMessage('Unexpected error. Please try again later.')
            }
        } finally {
            setLoading(()=>false)
        }
    }

    return (
        <div className='bg-[#060019] w-full'>
            <div
                className='w-[90%] md:w-[80%] mx-auto flex flex-col lg:flex-row justify-center lg:justify-start items-center text-white py-2 md:py-10 gap-2 md:gap-4'>
                <span className='text-[1em] md:text-[1.4em] font-medium'>Join our Newsletter</span>
                <div className='flex-grow w-full lg:w-auto'>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='rounded-full bg-gray-100 text-gray-700 placeholder:text-gray-400
                        px-4 py-3 md:py-4 w-full border-none outline-none text-[.8em] md:text-[.9em]'
                        placeholder='Enter email to join our newsletter'
                    />
                </div>
                <Button
                    disabled={loading}
                    onClick={handleSubscribe}
                    className='w-[200px] h-full lg:w-auto bg-gradient-to-l from-[#FE8C00] to-[#FF6B00] text-white text-[.8em] md:text-[.9em] px-6 py-2 md:py-4 rounded-full cursor-pointer'>
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </div>
            {message && (
                <p className="text-center text-sm text-white mt-2">{message}</p>
            )}
        </div>
    )
}

export default Subscribe
