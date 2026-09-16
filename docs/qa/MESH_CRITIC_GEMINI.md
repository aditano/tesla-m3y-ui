# Mesh & Visual Critique: Current vs. Hyper-Real Reference

## 1. Paint Material
- **Current**: The red paint looks like a rough, noisy glitter bomb. The clearcoat normal map is way too strong and high-frequency, making it look like sandpaper rather than automotive paint.
- **Reference**: Smooth, deep metallic red with a clean, glossy clearcoat. The specular highlights are soft and continuous, not broken up by noise.

## 2. Glass Material
- **Current**: The glass is completely opaque and black. It lacks any transmission, reflection, or depth. It looks like black plastic.
- **Reference**: The glass is reflective, showing the environment, with a subtle gradient and transparency.

## 3. Wheels
- **Current**: The wheels are low-poly, featureless black cylinders with a red block in the center. They look like placeholder geometry.
- **Reference**: Detailed rims and tires with proper metallic and rubber materials.

## 4. Lighting & Environment
- **Current**: The lighting is flat and harsh, creating blown-out highlights and hard shadows. The environment map is likely not contributing enough realistic reflections.
- **Reference**: Soft, realistic environment lighting (HDRI) that wraps around the car's curves, highlighting the design lines.

## 5. Chrome & Trim
- **Current**: The chrome trim around the windows and door handles is either missing, dull, or blending in with the rest of the car.
- **Reference**: Clear, distinct metallic trim that catches the light.

## 6. UI Leaders & Hotspots
- **Current**: The leaders use bulky, solid grey boxes for the "Open" buttons. The stems are thick and the dots are large squares. It looks clunky.
- **Reference**: Elegant, thin lines pointing to small square targets on the car. The buttons are clean, semi-transparent, and modern.

## Action Plan (Top 5 Fixes)
1. **Fix Paint**: Remove or drastically reduce the noise texture in the clearcoat and roughness maps. Adjust metalness and clearcoat values for a smooth, glossy finish.
2. **Fix Glass**: Enable transmission and transparency. Adjust opacity and IOR to make it look like real automotive glass.
3. **Fix Lighting**: Change the environment preset or adjust intensity to get softer, more realistic reflections.
4. **Fix UI Leaders**: Redesign the hotspot CSS to use thinner stems, smaller dots, and cleaner, more modern buttons with rounded corners and better typography.
5. **Fix Chrome/Trim**: Adjust the chrome material to be more metallic and reflective, ensuring it stands out from the paint.
