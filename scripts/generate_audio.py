import asyncio
import edge_tts
import subprocess
import json
import os
import math
import struct
import wave

AUDIO_DIR = '/tmp/demo_audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Generate synthetic SFX
def make_wav(filename, duration, sample_rate, gen_fn):
    n_samples = int(duration * sample_rate)
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for i in range(n_samples):
            t = i / sample_rate
            l, r = gen_fn(t, duration)
            l = max(-1.0, min(1.0, l))
            r = max(-1.0, min(1.0, r))
            frames.extend(struct.pack('<hh', int(l * 32767), int(r * 32767)))
        wf.writeframes(frames)

# Click
make_wav(f'{AUDIO_DIR}/click.wav', 0.06, 44100, 
    lambda t, d: (
        math.sin(2 * math.pi * 1400 * t) * math.exp(-t * 90),
        math.sin(2 * math.pi * 1450 * t) * math.exp(-t * 90)
    )
)

# Critical Alarm sweep
make_wav(f'{AUDIO_DIR}/alert.wav', 0.8, 44100, 
    lambda t, d: (
        0.35 * math.sin(2 * math.pi * (300 + 100 * math.sin(20 * math.pi * t)) * t) * (1 - t/d),
        0.35 * math.sin(2 * math.pi * (310 + 100 * math.sin(20 * math.pi * t)) * t) * (1 - t/d)
    )
)

# Success chime (Major triad chord: C5, E5, G5)
make_wav(f'{AUDIO_DIR}/success.wav', 1.0, 44100, 
    lambda t, d: (
        0.2 * (math.sin(2 * math.pi * 523.25 * t) + math.sin(2 * math.pi * 659.25 * t) + math.sin(2 * math.pi * 783.99 * t)) * math.exp(-t * 3),
        0.2 * (math.sin(2 * math.pi * 523.25 * t) + math.sin(2 * math.pi * 659.25 * t) + math.sin(2 * math.pi * 783.99 * t)) * math.exp(-t * 3)
    )
)

# Data Stream telemetry blip
make_wav(f'{AUDIO_DIR}/telemetry.wav', 1.2, 44100,
    lambda t, d: (
        0.15 * math.sin(2 * math.pi * (800 + 400 * math.sin(30 * math.pi * t)) * t) * (1 - t/d),
        0.15 * math.sin(2 * math.pi * (850 + 400 * math.sin(30 * math.pi * t)) * t) * (1 - t/d)
    )
)

# Voiceover lines
VOICEOVERS = [
    {
        'id': 's1_intro',
        'text': 'Meet Thesis Shredder. Built for the Nansen Meridian Buildathon, Thesis Shredder is an adversarial due diligence engine that stress-tests crypto investment theses against raw on-chain reality.',
        'pause_after': 1.0
    },
    {
        'id': 's2_catnip',
        'text': 'Suppose crypto Twitter is hyping CATNIP, claiming smart money is accumulating and dev tokens are locked. With one click, Thesis Shredder interrogates the thesis, firing live queries across Nansens REST API.',
        'pause_after': 1.0
    },
    {
        'id': 's3_shred',
        'text': 'The verdict is brutal: 85 percent Critical Risk. Nansen data exposes that Smart Money is dumping, dev liquidity is completely unlocked, and 92 percent of supply is controlled by a coordinated 11-wallet sybil cabal.',
        'pause_after': 1.2
    },
    {
        'id': 's4_builder',
        'text': 'No thesis yet? The Guided Wizard lets any investor construct institutional hypotheses in seconds. Select your narrative drivers, stance, and timeline, and auto-synthesize directly into the terminal.',
        'pause_after': 1.0
    },
    {
        'id': 's5_aave',
        'text': 'Now let us test Aave. Here, Nansen verifies true fundamental strength: an 18 percent Low Risk score, validated smart money accumulation, and healthy decentralized liquidity.',
        'pause_after': 1.2
    },
    {
        'id': 's6_outro',
        'text': 'Featuring full REST API endpoints, automated harvester pipeline, and graph cluster analytics, Thesis Shredder surfaces the truth before the market breaks your thesis.',
        'pause_after': 2.0
    }
]

async def build_audio():
    print("Generating speech clips...")
    clips = []
    total_time = 0.0
    markers = {}

    for vo in VOICEOVERS:
        filepath = f"{AUDIO_DIR}/{vo['id']}.mp3"
        comm = edge_tts.Communicate(vo['text'], 'en-US-ChristopherNeural', rate='+8%')
        await comm.save(filepath)
        
        # probe duration
        res = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', filepath], capture_output=True, text=True)
        dur = float(json.loads(res.stdout)['format']['duration'])
        
        markers[vo['id']] = {
            'start': total_time,
            'duration': dur,
            'end': total_time + dur,
            'text': vo['text']
        }
        total_time += dur + vo['pause_after']
        clips.append((filepath, dur, vo['pause_after']))
        print(f"  {vo['id']}: start={markers[vo['id']]['start']:.2f}s, dur={dur:.2f}s")

    print(f"Total video duration will be: {total_time:.2f} seconds")

    # Now assemble complex audio track using ffmpeg
    # Mix ambient pad + voiceover clips at exact timestamps + SFX
    filter_complex = []
    inputs = []
    input_idx = 0

    # 0: Ambient tech synth bed
    # We can create a subtle, deep synth pad using aevalsrc
    pad_expr = "0.04*sin(2*PI*55*t)+0.03*sin(2*PI*110*t)+0.02*sin(2*PI*164.81*t)+0.015*sin(2*PI*220*t)"
    # Generate pad wav
    make_wav(f'{AUDIO_DIR}/ambient_pad.wav', total_time + 2.0, 44100,
        lambda t, d: (
            (0.04*math.sin(2*math.pi*55*t) + 0.025*math.sin(2*math.pi*110*t) + 0.018*math.sin(2*math.pi*164.81*t) + 0.012*math.sin(2*math.pi*220*t)) * min(1.0, t/2.0) * min(1.0, (d - t)/2.0),
            (0.04*math.sin(2*math.pi*55.5*t) + 0.025*math.sin(2*math.pi*110.5*t) + 0.018*math.sin(2*math.pi*165.2*t) + 0.012*math.sin(2*math.pi*220.5*t)) * min(1.0, t/2.0) * min(1.0, (d - t)/2.0)
        )
    )
    inputs.extend(['-i', f'{AUDIO_DIR}/ambient_pad.wav'])
    pad_input = input_idx
    input_idx += 1

    # Add each voiceover clip delayed by its start time
    vo_audio_nodes = []
    for vo in VOICEOVERS:
        filepath = f"{AUDIO_DIR}/{vo['id']}.mp3"
        inputs.extend(['-i', filepath])
        start_ms = int(markers[vo['id']]['start'] * 1000)
        filter_complex.append(f"[{input_idx}:a]adelay={start_ms}|{start_ms}[vo_{vo['id']}];")
        vo_audio_nodes.append(f"[vo_{vo['id']}]")
        input_idx += 1

    # SFX:
    # 1. CATNIP Interrogate click at s2 start + 4s
    sfx_click_time = markers['s2_catnip']['start'] + 4.5
    inputs.extend(['-i', f'{AUDIO_DIR}/click.wav'])
    filter_complex.append(f"[{input_idx}:a]adelay={int(sfx_click_time*1000)}|{int(sfx_click_time*1000)}[sfx_c1];")
    vo_audio_nodes.append("[sfx_c1]")
    input_idx += 1

    # 2. Telemetry stream at s2 start + 5s
    sfx_telemetry_time = markers['s2_catnip']['start'] + 5.0
    inputs.extend(['-i', f'{AUDIO_DIR}/telemetry.wav'])
    filter_complex.append(f"[{input_idx}:a]adelay={int(sfx_telemetry_time*1000)}|{int(sfx_telemetry_time*1000)}[sfx_tel];")
    vo_audio_nodes.append("[sfx_tel]")
    input_idx += 1

    # 3. Critical alert chime when score appears in s3
    sfx_alert_time = markers['s3_shred']['start'] + 0.8
    inputs.extend(['-i', f'{AUDIO_DIR}/alert.wav'])
    filter_complex.append(f"[{input_idx}:a]adelay={int(sfx_alert_time*1000)}|{int(sfx_alert_time*1000)}[sfx_alt];")
    vo_audio_nodes.append("[sfx_alt]")
    input_idx += 1

    # 4. Success chime for Aave in s5
    sfx_succ_time = markers['s5_aave']['start'] + 3.5
    inputs.extend(['-i', f'{AUDIO_DIR}/success.wav'])
    filter_complex.append(f"[{input_idx}:a]adelay={int(sfx_succ_time*1000)}|{int(sfx_succ_time*1000)}[sfx_suc];")
    vo_audio_nodes.append("[sfx_suc]")
    input_idx += 1

    # Combine all
    all_sources = f"[{pad_input}:a]" + "".join(vo_audio_nodes)
    total_mix_count = 1 + len(vo_audio_nodes)
    filter_complex.append(f"{all_sources}amix=inputs={total_mix_count}:duration=first:dropout_transition=2[outa]")

    cmd = ['ffmpeg', '-y'] + inputs + ['-filter_complex', "".join(filter_complex), '-map', '[outa]', f'{AUDIO_DIR}/final_soundtrack.mp3']
    
    subprocess.run(cmd, check=True)
    print("Master soundtrack generated successfully at", f"{AUDIO_DIR}/final_soundtrack.mp3")

    with open('/tmp/video_markers.json', 'w') as f:
        json.dump({
            'total_duration': total_time,
            'markers': markers
        }, f, indent=2)

asyncio.run(build_audio())
