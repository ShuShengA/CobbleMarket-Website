import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;

/** 裁剪一块区域并放大，用来肉眼核对细节。用法：java Crop.java <图> <x> <y> <w> <h> [倍数] <输出> */
public class Crop {
    public static void main(String[] a) throws Exception {
        BufferedImage s = ImageIO.read(new File(a[0]));
        int x = Integer.parseInt(a[1]), y = Integer.parseInt(a[2]);
        int w = Integer.parseInt(a[3]), h = Integer.parseInt(a[4]);
        int scale = a.length > 6 ? Integer.parseInt(a[5]) : 2;
        BufferedImage o = new BufferedImage(w * scale, h * scale, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = o.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        g.drawImage(s, 0, 0, w * scale, h * scale, x, y, x + w, y + h, null);
        g.dispose();
        ImageIO.write(o, "png", new File(a[a.length - 1]));
        System.out.println("ok " + a[a.length - 1] + "  从 " + s.getWidth() + "x" + s.getHeight() + " 裁 " + x + "," + y + " " + w + "x" + h);
    }
}
