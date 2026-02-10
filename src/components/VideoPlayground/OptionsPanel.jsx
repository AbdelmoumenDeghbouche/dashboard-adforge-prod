const OptionsPanel = ({ options, setOptions, disabled }) => {
  const aspectRatios = [
    { value: '9:16', label: '9:16', description: 'Vertical (TikTok, Instagram Reels)' },
    { value: '16:9', label: '16:9', description: 'Horizontal (YouTube)' },
    { value: '1:1', label: '1:1', description: 'Square (Instagram Feed)' },
  ];

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'tiktok':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      case 'snap':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.206 2.024c-2.881.084-5.742 2.493-6.018 6.401-.037.632-.123 1.106-.408 1.578-.273.427-.736.827-1.169 1.123-.324.221-.75.555-.75.555-.069.046-.127.094-.188.136a.598.598 0 00-.181.188c-.038.063-.075.131-.091.213-.037.188.019.431.225.569.394.263 1.169.394 1.881.544.206.044.419.094.619.15.088.025.169.056.244.088-.056.269-.206.619-.469 1.106-.287.531-.681 1.181-1.169 1.931-.494.756-.731 1.206-.731 1.631 0 .269.137.544.444.656.294.113.7.113 1.169.038.419-.069.831-.194 1.206-.319.369-.119.7-.219.969-.269.137-.031.262-.05.381-.05.231 0 .419.062.575.181.194.15.394.412.637.75.15.219.319.475.525.762.394.556.906 1.269 1.594 1.875.656.588 1.506 1.119 2.569 1.119h.038c1.063 0 1.913-.531 2.569-1.119.688-.606 1.2-1.319 1.594-1.875.206-.287.375-.544.525-.762.244-.338.444-.6.637-.75.156-.119.344-.181.575-.181.119 0 .244.019.381.05.269.05.6.15.969.269.375.125.787.25 1.206.319.469.075.875.075 1.169-.038.306-.112.444-.387.444-.656 0-.425-.237-.875-.731-1.631-.488-.75-.881-1.4-1.169-1.931-.262-.487-.413-.837-.469-1.106.075-.031.156-.063.244-.088.2-.056.413-.106.619-.15.712-.15 1.488-.281 1.881-.544.206-.138.262-.381.225-.569-.016-.081-.053-.15-.091-.213a.598.598 0 00-.181-.188c-.061-.044-.119-.09-.188-.136 0 0-.425-.334-.75-.555-.431-.296-.894-.696-1.169-1.123-.285-.472-.371-.946-.408-1.578-.275-3.908-3.136-6.317-6.018-6.401L12.206 2.024z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const platforms = [
    { value: 'tiktok', label: 'TikTok' },
    { value: 'snap', label: 'Snapchat' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const providers = [
    {
      value: 'openai',
      label: 'OpenAI Sora',
      description: '8 or 12 seconds',
      badge: 'Fast',
    },
    {
      value: 'kie',
      label: 'KIE',
      description: '10 or 15 seconds',
      badge: 'Quality',
    },
  ];

  const handleProviderChange = (newProvider) => {
    const defaultDuration = newProvider === 'openai' ? 12 : 15;
    
    setOptions({
      ...options,
      provider: newProvider,
      duration: defaultDuration,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">3. Video Options</h3>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-3">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() =>
                setOptions({ ...options, aspect_ratio: ratio.value })
              }
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                options.aspect_ratio === ratio.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
              }`}
            >
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-white">{ratio.label}</div>
                <div className="text-xs text-gray-400">{ratio.description}</div>
              </div>
              {options.aspect_ratio === ratio.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Platform</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform.value}
              onClick={() => setOptions({ ...options, platform: platform.value })}
              disabled={disabled}
              className={`relative p-3 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                options.platform === platform.value
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-[#262626] bg-[#1A1A1A] text-gray-400 hover:border-purple-500/50 hover:text-purple-300'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  {getPlatformIcon(platform.value)}
                </div>
                <div className="text-sm font-medium text-white">
                  {platform.label}
                </div>
              </div>
              {options.platform === platform.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Provider */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Video Provider
        </label>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((provider) => (
            <button
              key={provider.value}
              onClick={() => handleProviderChange(provider.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                options.provider === provider.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">
                    {provider.label}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {provider.badge}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{provider.description}</div>
              </div>
              {options.provider === provider.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Duration</label>
        <div className="grid grid-cols-2 gap-3">
          {options.provider === 'openai' ? (
            <>
              <button
                onClick={() => setOptions({ ...options, duration: 8 })}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  options.duration === 8
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">8s</div>
                  <div className="text-xs text-gray-400 mt-1">Short</div>
                </div>
                {options.duration === 8 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
              <button
                onClick={() => setOptions({ ...options, duration: 12 })}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  options.duration === 12
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12s</div>
                  <div className="text-xs text-gray-400 mt-1">Standard</div>
                </div>
                {options.duration === 12 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setOptions({ ...options, duration: 10 })}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  options.duration === 10
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10s</div>
                  <div className="text-xs text-gray-400 mt-1">Standard</div>
                </div>
                {options.duration === 10 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
              <button
                onClick={() => setOptions({ ...options, duration: 15 })}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  options.duration === 15
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15s</div>
                  <div className="text-xs text-gray-400 mt-1">Extended</div>
                </div>
                {options.duration === 15 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cost Display */}
      <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#262626] rounded-xl">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white">Cost per Video</div>
            <div className="text-xs text-gray-400">
              Deducted upon generation start
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">1000</div>
          <div className="text-xs text-gray-400">credits</div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;

