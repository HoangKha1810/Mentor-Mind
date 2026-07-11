type OgTone = 'cyan' | 'violet' | 'emerald' | 'orange' | 'rose' | 'blue';

type MentorMindOgImageProps = {
  eyebrow: string;
  title: string;
  description: string;
  chips?: string[];
  tone?: OgTone;
};

const toneMap: Record<OgTone, { from: string; via: string; to: string; glow: string }> = {
  cyan: {
    from: '#0891b2',
    via: '#2563eb',
    to: '#7c3aed',
    glow: 'rgba(34, 211, 238, 0.34)',
  },
  violet: {
    from: '#7c3aed',
    via: '#c026d3',
    to: '#2563eb',
    glow: 'rgba(168, 85, 247, 0.34)',
  },
  emerald: {
    from: '#059669',
    via: '#0d9488',
    to: '#0891b2',
    glow: 'rgba(52, 211, 153, 0.32)',
  },
  orange: {
    from: '#f97316',
    via: '#e11d48',
    to: '#7c3aed',
    glow: 'rgba(251, 146, 60, 0.32)',
  },
  rose: {
    from: '#e11d48',
    via: '#be185d',
    to: '#7c3aed',
    glow: 'rgba(251, 113, 133, 0.32)',
  },
  blue: {
    from: '#2563eb',
    via: '#0284c7',
    to: '#4f46e5',
    glow: 'rgba(96, 165, 250, 0.32)',
  },
};

export const ogSize = {
  width: 1200,
  height: 630,
};

export function MentorMindOgImage({
  eyebrow,
  title,
  description,
  chips = ['Roadmap AI', 'Mentor 1-1', 'Job-ready'],
  tone = 'cyan',
}: MentorMindOgImageProps) {
  const colors = toneMap[tone];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#07111f',
        color: 'white',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 18% 12%, ${colors.glow}, transparent 34%), radial-gradient(circle at 86% 20%, rgba(168,85,247,.24), transparent 32%), linear-gradient(135deg, #07111f 0%, #0f172a 44%, #08111f 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -120,
          bottom: -160,
          width: 520,
          height: 520,
          borderRadius: 999,
          background: colors.glow,
          filter: 'blur(18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -220,
          top: 96,
          width: 480,
          height: 330,
          borderRadius: 54,
          transform: 'rotate(-10deg)',
          backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.via}, ${colors.to})`,
          opacity: 0.76,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 38,
          border: '1px solid rgba(255,255,255,.13)',
          borderRadius: 42,
          background: 'rgba(255,255,255,.035)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: '66px 76px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 58,
                height: 58,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                boxShadow: `0 18px 60px ${colors.glow}`,
                fontSize: 30,
              }}
            >
              🧠
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.8 }}>MentorMind</div>
              <div style={{ fontSize: 16, color: 'rgba(226,232,240,.78)' }}>AI learning platform</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 999,
              padding: '12px 18px',
              background: 'rgba(15,23,42,.58)',
              color: '#bae6fd',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            mentormind.center
          </div>
        </div>

        <div style={{ display: 'flex', maxWidth: 820, flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              borderRadius: 999,
              padding: '10px 16px',
              background: 'rgba(34,211,238,.13)',
              border: '1px solid rgba(103,232,249,.26)',
              color: '#67e8f9',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: title.length > 66 ? 52 : 60,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: -2.4,
              maxWidth: 740,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 25,
              lineHeight: 1.42,
              color: 'rgba(226,232,240,.82)',
              maxWidth: 720,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {chips.slice(0, 4).map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                borderRadius: 999,
                padding: '11px 16px',
                border: '1px solid rgba(255,255,255,.14)',
                background: 'rgba(255,255,255,.075)',
                color: 'rgba(255,255,255,.9)',
                fontSize: 18,
                fontWeight: 760,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
