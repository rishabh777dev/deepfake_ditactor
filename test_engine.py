import ai_engine
import os
import tempfile
import random

# Simulate a fake WhatsApp forwarded audio file (50KB)
with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False, prefix='whatsapp_forward_') as f:
    f.write(bytes([random.randint(0, 255) for _ in range(51200)]))
    tmp = f.name

result = ai_engine.analyze_audio_file(tmp, 'whatsapp_forward_audio.ogg')

print("=== TruthGuard AI Test ===")
print(f"Verdict       : {result['verdict']}")
print(f"Final Score   : {result['confidence_score']}%")
print(f"Voice Score   : {result['analysis']['voice_patterns']['score']}")
print(f"Spectral Score: {result['analysis']['spectral_analysis']['score']}")
print(f"Metadata Score: {result['analysis']['metadata_analysis']['score']}")
print("\nFlags:")
for flag in result['analysis']['voice_patterns']['flags']:
    print(f"  [VOICE]    {flag}")
for flag in result['analysis']['spectral_analysis']['flags']:
    print(f"  [SPECTRAL] {flag}")
for flag in result['analysis']['metadata_analysis']['flags']:
    print(f"  [META]     {flag}")

os.unlink(tmp)
print("\nTest complete!")
