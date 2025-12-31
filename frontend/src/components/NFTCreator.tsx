import React, { useState, useRef } from 'react';
import { MintAnimation } from '../nft/MintAnimation';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  royaltyPercentage: number;
}

// =============================================
// COMPONENT
// =============================================

export const NFTCreator: React.FC = () => {
  const { play } = useSFX();
  
  // Form state
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    symbol: '',
    description: '',
    royaltyPercentage: 5,
  });

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Minting animation state
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'revealing' | 'done'>('idle');
  const [mintPreview, setMintPreview] = useState<string | null>(null);

  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // =============================================
  // HANDLERS
  // =============================================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setUploadedImage(imageUrl);
      setMintPreview(imageUrl); // Set preview for animation
      play('buy');
    };
    reader.readAsDataURL(file);
  };

  const handleMetadataChange = (field: keyof NFTMetadata, value: string | number) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleMint = async () => {
    // Validation
    if (!mintPreview) {
      alert('Please upload an image first');
      return;
    }

    if (!metadata.name.trim()) {
      alert('Please enter NFT name');
      return;
    }

    if (!metadata.symbol.trim()) {
      alert('Please enter NFT symbol');
      return;
    }

    // Start animation
    setMintingStatus('minting');
    setIsProcessing(true);

    try {
      // =============================================
      // ACTUAL SOLANA MINT LOGIC HERE
      // =============================================
      
      // Simulate minting process (replace with real Metaplex mint)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual mint function:
      // const result = await mintNftToSolana({
      //   image: mintPreview,
      //   name: metadata.name,
      //   symbol: metadata.symbol,
      //   description: metadata.description,
      //   royaltyBasisPoints: metadata.royaltyPercentage * 100,
      // });

      // Move to reveal
      setMintingStatus('revealing');
      play('shotgun');

      // Wait 1.4 seconds for animation timing
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Final done state
      setMintingStatus('done');
      play('alert');

    } catch (err) {
      console.error('Mint failed:', err);
      alert('Minting failed. Please try again.');
      setMintingStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseMintAnimation = () => {
    setMintingStatus('idle');
    // Keep mintPreview for potential re-mint, but reset form if desired
    // setMintPreview(null);
    // setUploadedImage(null);
    // setMetadata({ name: '', symbol: '', description: '', royaltyPercentage: 5 });
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <>
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '24px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#FF3EBF',
            textShadow: '0 0 20px rgba(255,62,191,0.8)',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: "'Impact', 'Anton', sans-serif",
            letterSpacing: '2px',
          }}
        >
          🎨 NFT CREATOR
        </div>

        {/* Main Card */}
        <div
          style={{
            border: '2px solid transparent',
            borderRadius: '16px',
            background: 'linear-gradient(#0B0B0F, #0B0B0F) padding-box, linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%) border-box',
            padding: '24px',
            boxShadow: '0 0 30px rgba(255,62,191,0.2)',
          }}
        >
          {/* Image Upload Section */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#00E4FF',
                marginBottom: '12px',
                textShadow: '0 0 8px rgba(0,228,255,0.6)',
              }}
            >
              NFT IMAGE
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                height: uploadedImage ? 'auto' : 300,
                border: '2px dashed #9B00FF',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: uploadedImage ? 'transparent' : 'rgba(155,0,255,0.05)',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00E4FF';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,228,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#9B00FF';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="NFT Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 400,
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#9B00FF',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>
                    Click to upload image
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    PNG, JPG, GIF (Max 10MB)
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Metadata Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00E4FF',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                NFT NAME
              </label>
              <input
                type="text"
                value={metadata.name}
                onChange={(e) => handleMetadataChange('name', e.target.value)}
                placeholder="My Cyberpunk NFT"
                maxLength={32}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  background: 'rgba(22,22,33,0.6)',
                  color: '#FFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9B00FF';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(155,0,255,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Symbol */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00E4FF',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                SYMBOL
              </label>
              <input
                type="text"
                value={metadata.symbol}
                onChange={(e) => handleMetadataChange('symbol', e.target.value.toUpperCase())}
                placeholder="CYBER"
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  background: 'rgba(22,22,33,0.6)',
                  color: '#FFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9B00FF';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(155,0,255,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00E4FF',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                DESCRIPTION
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="A unique cyberpunk NFT from DCK Tools..."
                maxLength={200}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  background: 'rgba(22,22,33,0.6)',
                  color: '#FFF',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9B00FF';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(155,0,255,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Royalty Percentage */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00E4FF',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                ROYALTY PERCENTAGE: {metadata.royaltyPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={metadata.royaltyPercentage}
                onChange={(e) => handleMetadataChange('royaltyPercentage', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#9B00FF',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#666',
                  marginTop: '4px',
                }}
              >
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim()}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: "'Impact', 'Anton', sans-serif",
              border: '3px solid #FF3EBF',
              borderRadius: '12px',
              background: isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim()
                ? 'rgba(100,100,100,0.3)'
                : 'linear-gradient(135deg, rgba(255,62,191,0.3) 0%, rgba(155,0,255,0.3) 100%)',
              color: isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim() ? '#666' : '#FF3EBF',
              cursor: isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim() ? 'not-allowed' : 'pointer',
              textShadow: isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim()
                ? 'none'
                : '0 0 10px rgba(255,62,191,0.6)',
              boxShadow: isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim()
                ? 'none'
                : '0 0 20px rgba(255,62,191,0.4)',
              transition: 'all 0.2s ease',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && mintPreview && metadata.name.trim() && metadata.symbol.trim()) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,62,191,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isProcessing || !mintPreview || !metadata.name.trim() || !metadata.symbol.trim()
                ? 'none'
                : '0 0 20px rgba(255,62,191,0.4)';
            }}
          >
            {isProcessing ? 'PROCESSING...' : '🚀 MINT NFT'}
          </button>

          {/* Info Text */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
            }}
          >
            NFT will be minted to your connected wallet on Solana
          </div>
        </div>
      </div>

      {/* Mint Animation Overlay */}
      {mintingStatus !== 'idle' && (
        <MintAnimation
          imageUrl={mintPreview}
          status={mintingStatus}
          onClose={handleCloseMintAnimation}
        />
      )}
    </>
  );
};

export default NFTCreator;
