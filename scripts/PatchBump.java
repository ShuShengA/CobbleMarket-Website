import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * 抹掉一块矩形瑕疵：逐列用「矩形上方 off 像素处」的颜色往下填。
 * 这样能贴合周围的渐变（纯黑区域直接用纯黑填会留下生硬边）。
 * 输出 PNG 无损中间产物，之后再交给 ShrinkJpg 压成发布尺寸。
 *
 * 用法：java PatchBump.java <输入> <输出PNG> <x0> <y0> <x1> <y1> [取样偏移=6]
 */
public class PatchBump {
    public static void main(String[] a) throws Exception {
        BufferedImage img = ImageIO.read(new File(a[0]));
        int x0 = Integer.parseInt(a[2]), y0 = Integer.parseInt(a[3]);
        int x1 = Integer.parseInt(a[4]), y1 = Integer.parseInt(a[5]);
        int off = a.length > 6 ? Integer.parseInt(a[6]) : 6;

        for (int x = x0; x <= x1; x++) {
            int srcY = Math.max(0, y0 - off);
            int c = img.getRGB(x, srcY);
            for (int y = y0; y <= y1; y++) img.setRGB(x, y, c);
        }
        ImageIO.write(img, "png", new File(a[1]));
        System.out.printf("patched %s  区域 (%d,%d)-(%d,%d) 共 %dx%d 像素%n",
                a[1], x0, y0, x1, y1, x1 - x0 + 1, y1 - y0 + 1);
    }
}
