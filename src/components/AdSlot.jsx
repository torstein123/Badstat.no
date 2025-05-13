import React, { useEffect } from 'react';

const AdSlot = ({ adSlot, adClient, adFormat = "auto", fullWidthResponsive = true, style = { display: 'block' } }) => {
  useEffect(() => {
    // Use setTimeout to delay the push call slightly
    // This can help ensure the container has dimensions before the ad loads
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }, 100); // 100ms delay

    // Clear the timeout if the component unmounts before it runs
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Combine provided style with defaults for better layout calculation
  const combinedStyle = {
    display: 'block', // Ensure it's block for size calculation
    minHeight: '90px', // Minimum height
    width: '100%', // Try to occupy full available width
    ...style, // Allow overriding with passed-in style prop
  };

  return (
    <ins className="adsbygoogle"
         style={combinedStyle}
         data-ad-client={adClient}
         data-ad-slot={adSlot}
         data-ad-format={adFormat}
         data-full-width-responsive={fullWidthResponsive}></ins>
  );
};

export default AdSlot; 